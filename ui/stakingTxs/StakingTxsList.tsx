import { Box } from '@chakra-ui/react';
import React from 'react';

import type { StakingTransaction } from 'types/api/stakingTransaction';

import useLazyRenderedList from 'lib/hooks/useLazyRenderedList';

import StakingTxsListItem from './StakingTxsListItem';

interface Props {
  currentAddress?: string;
  isLoading: boolean;
  items: Array<StakingTransaction>;
}

const StakingTxsList = (props: Props) => {
  const { cutRef, renderedItemsNum } = useLazyRenderedList(props.items, !props.isLoading);

  return (
    <Box>
      { props.items.slice(0, renderedItemsNum).map((tx, index) => (
        <StakingTxsListItem
          key={ tx.hash + (props.isLoading ? index : '') }
          tx={ tx }
          currentAddress={ props.currentAddress }
          isLoading={ props.isLoading }
        />
      )) }
      <Box ref={ cutRef } h={ 0 }/>
    </Box>
  );
};

export default React.memo(StakingTxsList);
