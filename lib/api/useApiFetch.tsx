import { useQueryClient } from '@tanstack/react-query';
import _omit from 'lodash/omit';
import _pickBy from 'lodash/pickBy';
import React from 'react';

import { getFeaturePayload } from 'configs/app/features/types';
import type { CsrfData } from 'types/client/account';
import type { ShardId } from 'types/shards';

import config from 'configs/app';
import isBodyAllowed from 'lib/api/isBodyAllowed';
import isNeedProxy from 'lib/api/isNeedProxy';
import { getResourceKey } from 'lib/api/useApiQuery';
import * as cookies from 'lib/cookies';
import type { Params as FetchParams } from 'lib/hooks/useFetch';
import useFetch from 'lib/hooks/useFetch';
import useShards from 'lib/hooks/useShards';

import buildUrl from './buildUrl';
import { RESOURCES } from './resources';
import type { ApiResource, ResourceError, ResourceName, ResourcePathParams } from './resources';

export interface Params<R extends ResourceName> {
  pathParams?: ResourcePathParams<R>;
  queryParams?: Record<string, string | Array<string> | number | boolean | undefined>;
  fetchParams?: Pick<FetchParams, 'body' | 'method' | 'signal' | 'headers'>;
}

export default function useApiFetch() {
  const fetch = useFetch();
  const queryClient = useQueryClient();
  const { shard } = useShards();

  const { token: csrfToken } = queryClient.getQueryData<CsrfData>(getResourceKey('csrf')) || {};

  return React.useCallback(async <R extends ResourceName, SuccessType = unknown, ErrorType = unknown>(
    resourceName: R,
    { pathParams, queryParams, fetchParams }: Params<R> = {},
  ) => {
    const apiToken = cookies.get(cookies.NAMES.API_TOKEN);

    const resource: ApiResource = RESOURCES[resourceName];
    let url = buildUrl(resourceName, pathParams, queryParams);
    const withBody = isBodyAllowed(fetchParams?.method);
    const headers = _pickBy({
      'x-endpoint': resource.endpoint && isNeedProxy() ? resource.endpoint : undefined,
      Authorization: resource.endpoint && resource.needAuth ? apiToken : undefined,
      'x-csrf-token': withBody && csrfToken ? csrfToken : undefined,
      ...resource.headers,
      ...fetchParams?.headers,
    }, Boolean) as HeadersInit;

    const isUsedShardingFeature = config.features.shards.isEnabled && resource.shardable;

    // Check domain for shardable resources
    if (isUsedShardingFeature) {
      if (resource.merge) {
        // We need request from all shards by using proxy and merge responses
        const configPayload = getFeaturePayload(config.features.shards);
        if (configPayload?.proxyUrl) {
          const proxyUrl = new URL(configPayload?.proxyUrl);
          const shardUrl = new URL(url);

          // Replace base url with proxy url
          shardUrl.protocol = proxyUrl.protocol;
          shardUrl.host = proxyUrl.host;

          // We need to replace host with proxy host
          url = shardUrl.toString();
        }
      } else if (shard) {
        // We need replace host with shard api host
        const shardUrl = new URL(url);
        shardUrl.host = resource.shardable === 'stats' ? shard.statsHost : shard.apiHost;
        url = shardUrl.toString();
      }
    }

    let response = await fetch<SuccessType, ErrorType>(
      url,
      {
        // as of today, we use cookies only
        //    for user authentication in My account
        //    for API rate-limits (cannot use in the condition though, but we agreed with devops team that should not be an issue)
        // change condition here if something is changed
        credentials: config.features.account.isEnabled ? 'include' : 'same-origin',
        headers,
        ..._omit(fetchParams, 'headers'),
      },
      {
        resource: resource.path,
        omitSentryErrorLog: true, // disable logging of API errors to Sentry
      },
    );

    if (isUsedShardingFeature && resource.merge) {
      // Merge responses from all shards
      const shards = getFeaturePayload(config.features.shards)?.shards || {};
      const shardsIds = Object.keys(shards);

      response = shardsIds.reduce((acc, shardId) => {
        const shardResponse = (response as Record<ShardId, {data: SuccessType}>)[shardId]['data'] || [];
        if (shardResponse && Array.isArray(shardResponse) && shardResponse.length > 0) {
          acc.push(...shardResponse as Array<never>);
        }

        return acc;
      }, [] as Array<never>) as ResourceError<ErrorType> | Awaited<SuccessType>;

      // Sort by timestamp
      type MergedResponse = Array<NonNullable<SuccessType> & {timestamp?: string}>;
      response = (response as MergedResponse).sort((a, b) => {
        if (!a.timestamp || !b.timestamp) {
          return 0;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }) as ResourceError<ErrorType> | Awaited<SuccessType>;
    }

    return response;
  }, [ csrfToken, fetch, shard ]);
}
