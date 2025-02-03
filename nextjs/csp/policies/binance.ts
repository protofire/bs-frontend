import type CspDev from 'csp-dev';

export function binance(): CspDev.DirectiveDescriptor {
  return {
    'connect-src': [
      'api.binance.com',
    ],
  };
}
