import type { Feature } from './types';
import type { ShardId, ShardInfo } from 'types/shards';

import { getEnvValue, parseEnvJson } from '../utils';

const title = 'Shards';

const config: Feature<{proxyUrl: string; shards: Record<ShardId, ShardInfo>; pages: Array<string>}> = (() => {
  const shards = parseEnvJson<Record<ShardId, ShardInfo>>(getEnvValue('NEXT_PUBLIC_SHARDS')) || {};
  const proxyUrl = getEnvValue('NEXT_PUBLIC_MULTI_SHARDS_PROXY_URL') || '';
  const isEnabled = proxyUrl?.length > 0;

  return Object.freeze({
    title,
    isEnabled,
    proxyUrl,
    shards,
    pages: [
      '/address',
      '/block/',
      '/blocks',
      '/tx',
    ],
  });
})();

export default config;
