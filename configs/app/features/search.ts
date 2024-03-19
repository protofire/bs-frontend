import type { Feature } from './types';

import { getEnvValue, parseEnvJson } from '../utils';

export type Shard = {
  id: string;
  title: string;
  url: string;
};

const title = 'Multishard search';

const config: Feature<{shardsIds: Array<string>; shards: Array<Shard> | null}> = (() => {
  const shards = parseEnvJson<Array<Shard>>(getEnvValue('NEXT_PUBLIC_SEARCH_SHARDS')) || [];
  const shardsIds = shards?.map((shard) => shard.id) || [];

  return Object.freeze({
    title,
    isEnabled: shards.length > 0,
    shards,
    shardsIds,
  });
})();

export default config;
