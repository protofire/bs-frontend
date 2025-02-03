import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { StakingApi } from 'types/api/stakingApi';

import stakingApi from 'configs/app/stakingApi';
import type { ResourceError } from 'lib/api/resources';
import useFetch from 'lib/hooks/useFetch';

export type StakingApiQuery = UseQueryResult<Array<StakingApi>, ResourceError<{ status: number }>>;

export function useStakingQuery({ hash }: { hash: string }): StakingApiQuery {
  const fetch = useFetch();
  return useQuery({
    queryKey: [ `staking_balance:${ hash }` ],
    queryFn: async() => await fetch(`${ stakingApi.host }/${ hash }`),
    refetchOnMount: false,
  });
}
