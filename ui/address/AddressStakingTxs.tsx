import { useRouter } from 'next/router';
import React from 'react';

import useIsMobile from 'lib/hooks/useIsMobile';
import getQueryParamString from 'lib/router/getQueryParamString';
import ActionBar from 'ui/shared/ActionBar';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import StakingTxsContent from 'ui/stakingTxs/StakingTxsContent';

type Props = {
  scrollRef?: React.RefObject<HTMLDivElement>;
};

const AddressStakingTxs = ({ scrollRef }: Props) => {
  const router = useRouter();

  const isMobile = useIsMobile();
  const currentAddress = getQueryParamString(router.query.hash);

  const addressTxsQuery = useQueryWithPages({
    resourceName: 'address_staking_txs',
    pathParams: { hash: currentAddress },
    scrollRef,
  });

  return (
    <>
      { !isMobile && (
        <ActionBar mt={ -6 }>
          <div></div>
          <Pagination { ...addressTxsQuery.pagination } ml={ 8 } isVisible={ true }/>
        </ActionBar>
      ) }
      <StakingTxsContent
        query={ addressTxsQuery }
        items={ addressTxsQuery.data?.items }
        currentAddress={
          typeof currentAddress === 'string' ? currentAddress : undefined
        }
        top={ 80 }
        isPlaceholderData={ addressTxsQuery.isPlaceholderData }
        isError={ addressTxsQuery.isError }
      />
    </>
  );
};

export default AddressStakingTxs;
