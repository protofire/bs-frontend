import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React from 'react';

import { getFeaturePayload } from 'configs/app/features/types';
import type { ShardId, ShardInfo } from 'types/shards';

import config from 'configs/app';

type UseShardsResult = {
  shardId?: ShardId;
  shard?: ShardInfo;
  defaultShardId?: ShardId;
  shards: Record<ShardId, ShardInfo>;
  getUrlWithShardId: (url: string) => string;
  setActiveShardId: (shardId: ShardId) => Promise<void>;
};

export default function useShards(): UseShardsResult {
  const queryStringParams = useSearchParams();
  const router = useRouter();

  return React.useMemo(
    () => {
      if (config.features.shards.isEnabled) {
        const shards = getFeaturePayload(config.features.shards)?.shards || {};
        const defaultShardId = Object.keys(shards)[0];
        const shardId = queryStringParams.get('shard') || defaultShardId;

        // In some case router don't know about shard, so we need to get it from first segment of url in case if window.location is available
        // if (!shardId && typeof window !== 'undefined') {
        //   const url = new URL(window.location.href);
        //   const shard = url.pathname.split('/')[1];
        //   const urlShardId = shard;

        //   if (shards[urlShardId as ShardId]) {
        //     query.shard = urlShardId;
        //   }
        // }

        const shardInfo = shards[shardId as ShardId];

        return {
          shardId,
          shard: shardInfo,
          shards,
          defaultShardId,
          async setActiveShardId(shardId: ShardId) {
            await router.push(
              { pathname: router.pathname, query: { ...router.query, shard: shardId } },
              undefined,
              { shallow: true },
            );
          },
          getUrlWithShardId(url: string): string {
            const shardablePages = getFeaturePayload(config.features.shards)?.pages;
            const isShardable = shardablePages?.find((page) => url.startsWith(page)) !== undefined;

            if (isShardable && shardId) {
              const newUrl = new URL(url as string, 'http://localhost:8080');

              // Add shardId to query params for tabs
              if (!newUrl.searchParams.has('shard')) {
                newUrl.searchParams.append('shard', shardId);
              }

              return newUrl.toString();
            }

            return url;
          },
        };
      }

      return {
        shards: {},
        setActiveShardId() {
          return Promise.resolve();
        },
        getUrlWithShardId(url: string): string {
          return url;
        },
      };
    },
    [ queryStringParams, router ],
  );
}
