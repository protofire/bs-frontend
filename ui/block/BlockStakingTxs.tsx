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

const BlockStakingTxs = ({ scrollRef }: Props) => {
  const router = useRouter();

  const isMobile = useIsMobile();

  const heightOrHash = getQueryParamString(router.query.height_or_hash);

  const blockTxsQuery = useQueryWithPages({
    resourceName: 'block_staking_txs',
    pathParams: { height_or_hash: heightOrHash },
    scrollRef,
  });

  return (
    <>
      { !isMobile && (
        <ActionBar mt={ -6 }>
          <Pagination { ...blockTxsQuery.pagination } ml={ 8 }/>
        </ActionBar>
      ) }
      <StakingTxsContent
        query={ blockTxsQuery }
        items={ blockTxsQuery.data?.items }
        currentAddress={ undefined }
        top={ 80 }
        isPlaceholderData={ blockTxsQuery.isPlaceholderData }
        isError={ blockTxsQuery.isError }
      />
    </>
  );
};

export default BlockStakingTxs;
