import dns from 'dns';
import http from 'http';
import https from 'https';
import net from 'net';

// Guards outgoing requests made on behalf of a user-provided URL (SSRF protection).
// Two independent layers are needed:
//   1. parseSafeUrl() rejects literal addresses in the URL itself, because net.connect()
//      skips DNS resolution entirely when the host is already an IP;
//   2. the guarded agents below validate every address DNS actually resolves to, which also
//      covers redirects and hostnames that intentionally point into the private space.

const ALLOWED_PROTOCOLS = [ 'http:', 'https:' ];

const BLOCKED_HOSTNAMES = [ 'localhost' ];
const BLOCKED_HOSTNAME_SUFFIXES = [ '.localhost', '.local', '.internal', '.home.arpa' ];

// loopback, RFC1918, CGNAT, link-local (includes the 169.254.169.254 cloud metadata endpoint),
// multicast and reserved space
const BLOCKED_IPV4_RANGES: Array<[ string, number ]> = [
  [ '0.0.0.0', 8 ],
  [ '10.0.0.0', 8 ],
  [ '100.64.0.0', 10 ],
  [ '127.0.0.0', 8 ],
  [ '169.254.0.0', 16 ],
  [ '172.16.0.0', 12 ],
  [ '192.0.0.0', 24 ],
  [ '192.168.0.0', 16 ],
  [ '198.18.0.0', 15 ],
  [ '224.0.0.0', 4 ],
  [ '240.0.0.0', 4 ],
];

const ipv4ToNumber = (address: string) => address
  .split('.')
  .reduce((result, octet) => result * 256 + Number(octet), 0);

const isBlockedIpv4 = (address: string) => {
  const value = ipv4ToNumber(address);

  return BLOCKED_IPV4_RANGES.some(([ rangeAddress, prefixLength ]) => {
    const mask = prefixLength === 0 ? 0 : (0xFFFFFFFF << (32 - prefixLength)) >>> 0;

    return ((value & mask) >>> 0) === ((ipv4ToNumber(rangeAddress) & mask) >>> 0);
  });
};

const isBlockedIpv6 = (address: string) => {
  const value = address.toLowerCase();

  if (value === '::' || value === '::1') {
    return true;
  }

  // IPv4-mapped and IPv4-compatible addresses have to be checked as IPv4;
  // note that new URL() canonicalizes them to the hex form (::ffff:a02:1b), not the dotted one
  const mappedHex = value.match(/^::(?:ffff:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const high = parseInt(mappedHex[1], 16);
    const low = parseInt(mappedHex[2], 16);

    return isBlockedIpv4([ high >> 8, high & 0xFF, low >> 8, low & 0xFF ].join('.'));
  }

  const mappedDotted = value.match(/^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mappedDotted) {
    return isBlockedIpv4(mappedDotted[1]);
  }

  const hextets = value.split(':');
  const firstHextet = parseInt(hextets[0] || '0', 16);

  // fc00::/7 unique local, fe80::/10 link-local and ff00::/8 multicast, plus the reserved
  // space in between, which we have no reason to reach either
  if (firstHextet >= 0xFC00) {
    return true;
  }

  // 64:ff9b::/96 NAT64
  return firstHextet === 0x64 && parseInt(hextets[1] || '0', 16) === 0xFF9B;
};

const isBlockedAddress = (address: string) =>
  net.isIP(address) === 4 ? isBlockedIpv4(address) : isBlockedIpv6(address);

const isBlockedHostname = (hostname: string) =>
  BLOCKED_HOSTNAMES.includes(hostname) ||
  BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix));

type LookupCallback = (
  error: NodeJS.ErrnoException | null,
  addressOrAddresses: string | Array<dns.LookupAddress>,
  family?: number,
) => void;

// net.connect() asks either for a single address or, when autoSelectFamily is on (the default
// since Node 20), for all of them at once - the callback shape differs, so both are handled.
// Blocked addresses are filtered out rather than failing the whole lookup, so a host with a
// public A record and, say, a link-local AAAA one still resolves.
const guardedLookup = (hostname: string, options: dns.LookupOptions, callback: LookupCallback) => {
  dns.lookup(hostname, options, (error, result: string | Array<dns.LookupAddress>, family) => {
    if (error) {
      callback(error, result, family);
      return;
    }

    if (Array.isArray(result)) {
      const allowed = result.filter(({ address }) => !isBlockedAddress(address));

      if (!allowed.length) {
        callback(new Error(`Host ${ hostname } resolves to blocked addresses only`), result, family);
        return;
      }

      callback(null, allowed, family);
      return;
    }

    if (isBlockedAddress(result)) {
      callback(new Error(`Host ${ hostname } resolves to a blocked address ${ result }`), result, family);
      return;
    }

    callback(null, result, family);
  });
};

// the intersection makes this compile regardless of whether the installed @types/node declares
// "lookup" on AgentOptions; the cast is needed because net.LookupFunction is typed for the
// single-address shape only, while Node also uses the all:true one at runtime
const AGENT_OPTIONS: http.AgentOptions & { lookup: net.LookupFunction } = {
  lookup: guardedLookup as unknown as net.LookupFunction,
};

const httpAgent = new http.Agent(AGENT_OPTIONS);
const httpsAgent = new https.Agent(AGENT_OPTIONS);

export const guardedAgent = (parsedUrl: URL) => parsedUrl.protocol === 'https:' ? httpsAgent : httpAgent;

// Throws when the URL is malformed or points somewhere we must not reach.
export function parseSafeUrl(rawUrl: string): URL {
  const url = new URL(rawUrl);

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    throw new Error(`Protocol ${ url.protocol } is not allowed`);
  }

  // new URL() normalizes shorthand and numeric IPv4 forms (2130706433, 0177.0.0.1, 127.1)
  // to the canonical dotted one, and wraps IPv6 in brackets
  const hostname = url.hostname.replace(/^\[|\]$/g, '');

  if (!hostname) {
    throw new Error('Hostname is empty');
  }

  if (net.isIP(hostname) ? isBlockedAddress(hostname) : isBlockedHostname(hostname)) {
    throw new Error(`Host ${ hostname } is not allowed`);
  }

  return url;
}
