import type { Feature } from './types';
import type { ShardId, ShardInfo } from 'types/shards';

import { getEnvValue, parseEnvJson } from '../utils';

export type ShardConfig = {
  proxyUrl: string;
  shards: Record<ShardId, ShardInfo>;
  pages: Array<string>;
};

const title = 'Shards';
const config: Feature<ShardConfig> = (() => {
  const shardsConfig = parseEnvJson<Array<ShardInfo>>(getEnvValue('NEXT_PUBLIC_SHARDS')) || [];
  const proxyUrl = getEnvValue('NEXT_PUBLIC_MULTI_SHARDS_PROXY_URL') || '';
  const isEnabled = proxyUrl?.length > 0;

  const shards: { [key: ShardId]: ShardInfo } = shardsConfig.reduce((acc: Record<ShardId, ShardInfo>, shard) => {
    acc[shard.id as ShardId] = shard;
    return acc;
  }, {});

  return Object.freeze({
    title,
    isEnabled,
    proxyUrl,
    shards,
    pages: [
      '/accounts',
      '/address',
      '/block/',
      '/blocks',
      '/tx',
      '/txs',
    ],
  });
})();

export default config;
