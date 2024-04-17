import { useRouter } from 'next/router';
import React from 'react';

import type {
  StakingTransactionsSortingField,
  StakingTransactionsSortingValue,
  StakingTransactionsSorting,
} from 'types/api/stakingTransaction';

import useIsMobile from 'lib/hooks/useIsMobile';
import getQueryParamString from 'lib/router/getQueryParamString';
import ActionBar from 'ui/shared/ActionBar';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import getSortParamsFromValue from 'ui/shared/sort/getSortParamsFromValue';
import getSortValueFromQuery from 'ui/shared/sort/getSortValueFromQuery';
import TxsWithAPISorting from 'ui/txs/TxsWithAPISorting';
import { SORT_OPTIONS } from 'ui/txs/useTxsSort';

type Props = {
  scrollRef?: React.RefObject<HTMLDivElement>;
};

const AddressStakingTxs = ({ scrollRef }: Props) => {
  const router = useRouter();
  const [ sort, setSort ] = React.useState<
  StakingTransactionsSortingValue | undefined
  >(
    getSortValueFromQuery<StakingTransactionsSortingValue>(
      router.query,
      SORT_OPTIONS,
    ),
  );

  const isMobile = useIsMobile();
  const currentAddress = getQueryParamString(router.query.hash);

  const addressTxsQuery = useQueryWithPages({
    resourceName: 'address_staking_txs',
    pathParams: { hash: currentAddress },
    sorting: getSortParamsFromValue<StakingTransactionsSortingValue, StakingTransactionsSortingField, StakingTransactionsSorting['order']>(sort),
    scrollRef,
  });

  return (
    <>
      { !isMobile && (
        <ActionBar mt={ -6 }>
          <Pagination { ...addressTxsQuery.pagination } ml={ 8 }/>
        </ActionBar>
      ) }
      <TxsWithAPISorting
        query={ addressTxsQuery }
        currentAddress={
          typeof currentAddress === 'string' ? currentAddress : undefined
        }
        enableTimeIncrement
        top={ 80 }
        sorting={ sort }
        setSort={ setSort }
      />
    </>
  );
};

export default AddressStakingTxs;
