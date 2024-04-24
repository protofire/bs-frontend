import { Box, Text } from '@chakra-ui/react';
import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';

import type { Log } from 'types/api/log';
import type { StakingTransaction } from 'types/api/stakingTransaction';

import type { ResourceError } from 'lib/api/resources';
import ActionBar from 'ui/shared/ActionBar';
import DataFetchAlert from 'ui/shared/DataFetchAlert';
import LogItem from 'ui/shared/logs/LogItem';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import TxPendingAlert from 'ui/tx/TxPendingAlert';

interface Props {
  txQuery: UseQueryResult<StakingTransaction, ResourceError>;
  logsFilter?: (log: Log) => boolean;
}

const StakingTxLogs = ({ txQuery, logsFilter }: Props) => {
  const { data, isPlaceholderData, isError, pagination } = useQueryWithPages({
    resourceName: 'staking_tx_logs',
    pathParams: { hash: txQuery.data?.hash },
  });

  if (
    !txQuery.isPending &&
    !txQuery.isPlaceholderData &&
    !txQuery.isError &&
    !txQuery.data.status
  ) {
    return <TxPendingAlert/>;
  }

  if (isError || txQuery.isError) {
    return <DataFetchAlert/>;
  }

  let items: Array<Log> = [];

  if (data?.items) {
    if (isPlaceholderData) {
      items = data?.items;
    } else {
      items = logsFilter ? data.items.filter(logsFilter) : data.items;
    }
  }

  if (!items.length) {
    return (
      <Text as="span">There are no logs for this staking transaction.</Text>
    );
  }

  return (
    <Box>
      { pagination.isVisible && (
        <ActionBar mt={ -6 }>
          <Pagination ml="auto" { ...pagination }/>
        </ActionBar>
      ) }
      { items.map((item, index) => (
        <LogItem
          key={ index }
          { ...item }
          type="staking_transaction"
          isLoading={ isPlaceholderData }
        />
      )) }
    </Box>
  );
};

export default StakingTxLogs;
