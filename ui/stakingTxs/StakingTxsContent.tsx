import { Show, Hide } from '@chakra-ui/react';
import React from 'react';

import type { StakingTransaction } from 'types/api/stakingTransaction';

import useIsMobile from 'lib/hooks/useIsMobile';
import DataListDisplay from 'ui/shared/DataListDisplay';
import type { QueryWithPagesResult } from 'ui/shared/pagination/useQueryWithPages';

import StakingTxsHeaderMobile from './StakingTxsHeaderMobile';
import StakingTxsList from './StakingTxsList';
import StakingTxsTable from './StakingTxsTable';

type Props = {
  // eslint-disable-next-line max-len
  query: QueryWithPagesResult<'address_staking_txs'>;
  currentAddress?: string;
  top?: number;
  items?: Array<StakingTransaction>;
  isPlaceholderData: boolean;
  isError: boolean;
}

const StakingTxsContent = ({
  query,
  currentAddress,
  top,
  items,
  isPlaceholderData,
  isError,
}: Props) => {
  const isMobile = useIsMobile();

  const content = items ? (
    <>
      <Show below="lg" ssr={ false }>
        <StakingTxsList
          isLoading={ isPlaceholderData }
          currentAddress={ currentAddress }
          items={ items }
        />
      </Show>
      <Hide below="lg" ssr={ false }>
        <StakingTxsTable
          txs={ items }
          top={ top || query.pagination.isVisible ? 48 : 0 }
          currentAddress={ currentAddress }
          isLoading={ isPlaceholderData }
        />
      </Hide>
    </>
  ) : null;

  const actionBar = isMobile ? (
    <StakingTxsHeaderMobile
      mt={ -6 }
      paginationProps={ query.pagination }
      showPagination={ query.pagination.isVisible }
    />
  ) : null;

  return (
    <DataListDisplay
      isError={ isError }
      items={ items }
      emptyText="There are no staking transactions."
      content={ content }
      actionBar={ actionBar }
    />
  );
};

export default StakingTxsContent;
