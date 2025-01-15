import { Table, Tbody, Tr, Th } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import React from 'react';

import type { StakingTransaction } from 'types/api/stakingTransaction';

import { AddressHighlightProvider } from 'lib/contexts/addressHighlight';
import useLazyRenderedList from 'lib/hooks/useLazyRenderedList';
import { currencyUnits } from 'lib/units';
import TheadSticky from 'ui/shared/TheadSticky';

import StakingTxsTableItem from './StakingTxsTableItem';

type Props = {
  txs: Array<StakingTransaction>;
  top: number;
  currentAddress?: string;
  isLoading?: boolean;
};

const StakingTxsTable = ({ txs, top, currentAddress, isLoading }: Props) => {
  const { cutRef, renderedItemsNum } = useLazyRenderedList(txs, !isLoading);
  return (
    <AddressHighlightProvider>
      <Table variant="simple" minWidth="950px" size="xs">
        <TheadSticky top={ top }>
          <Tr>
            <Th width="180px">Hash</Th>
            <Th width="160px">Type</Th>
            <Th width="160px">Block</Th>
            <Th width="160px">Validator</Th>
            <Th width="160px">From</Th>
            <Th width="160px">{ `Value ${ currencyUnits.ether }` }</Th>
          </Tr>
        </TheadSticky>
        <Tbody>
          <AnimatePresence initial={ false }>
            { txs.slice(0, renderedItemsNum).map((item, index) => (
              <StakingTxsTableItem
                key={ item.hash + (isLoading ? index : '') }
                tx={ item }
                currentAddress={ currentAddress }
                isLoading={ isLoading }
              />
            )) }
          </AnimatePresence>
        </Tbody>
      </Table>
      <div ref={ cutRef }/>
    </AddressHighlightProvider>
  );
};

export default React.memo(StakingTxsTable);
