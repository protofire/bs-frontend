import { createPublicClient, http } from 'viem';

import { getFeaturePayload } from 'configs/app/features/types';

import config from 'configs/app';

import currentChain from './currentChain';

function getPublicClient() {
  if (currentChain.rpcUrls.public.http.filter(Boolean).length === 0) {
    return;
  }

  try {
    return createPublicClient({
      chain: currentChain,
      transport: http(),
      batch: {
        multicall: true,
      },
    });
  } catch (error) {}
}

export const publicClient = getPublicClient();

export const getShardPublicClient = (shardId?: string) => {
  if (!shardId) {
    return;
  }

  const shard = config.features.shards.isEnabled ?
    getFeaturePayload(config.features.shards)?.shards[shardId] :
    undefined;

  if (!shard) {
    return;
  }

  try {
    return createPublicClient({
      chain: { ...currentChain, ...shard.chain },
      transport: http(shard.apiHost),
      batch: {
        multicall: true,
      },
    });
  } catch (error) {}
};
