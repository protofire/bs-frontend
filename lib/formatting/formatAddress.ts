import { bech32 } from 'bech32';

const { encode, decode, toWords, fromWords } = bech32;

export function toBech32(address: string) {
  const bytes = Buffer.from(address.slice(2), 'hex');
  return encode('one', toWords(bytes));
}

export function fromBech32(address: string) {
  const { words } = decode(address);
  return '0x' + Buffer.from(fromWords(words)).toString('hex');
}
