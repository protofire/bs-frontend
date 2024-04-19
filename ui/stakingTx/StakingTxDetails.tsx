import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';

import type { StakingTransaction } from 'types/api/stakingTransaction';

import type { ResourceError } from 'lib/api/resources';
import TestnetWarning from 'ui/shared/alerts/TestnetWarning';
import DataFetchAlert from 'ui/shared/DataFetchAlert';

import StakingTxInfo from './StakingTxInfo';

interface Props {
  query: UseQueryResult<StakingTransaction, ResourceError<unknown>>;
}

const TxDetails = ({ query }: Props) => {
  if (query.isError) {
    return <DataFetchAlert/>;
  }

  return (
    <>
      <TestnetWarning mb={ 6 } isLoading={ query.isPlaceholderData }/>
      <StakingTxInfo data={ query.data } isLoading={ query.isPlaceholderData }/>
    </>
  );
};

export default React.memo(TxDetails);
