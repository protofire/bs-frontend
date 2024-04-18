import { Tr, Td, VStack, Skeleton } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

import type { StakingTransaction } from 'types/api/stakingTransaction';

import useTimeAgoIncrement from 'lib/hooks/useTimeAgoIncrement';
import AddressFromTo from 'ui/shared/address/AddressFromTo';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import StakingTxEntity from 'ui/shared/entities/stakingTx/StakingTxEntity';
import StakingTxType from 'ui/shared/stakingTx/StakingTxType';

type Props = {
  tx: StakingTransaction;
  currentAddress?: string;
  isLoading?: boolean;
};

const StakingTxsTableItem = ({ tx, currentAddress, isLoading }: Props) => {
  const timeAgo = useTimeAgoIncrement(tx.timestamp, true);

  return (
    <Tr
      as={ motion.tr }
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transitionDuration="normal"
      transitionTimingFunction="linear"
      key={ tx.hash }
    >
      <Td pr={ 4 }>
        <VStack alignItems="start" lineHeight="24px">
          <StakingTxEntity
            hash={ tx.hash }
            isLoading={ isLoading }
            fontWeight={ 700 }
            noIcon
            maxW="100%"
            truncation="constant_long"
          />
          { tx.timestamp && (
            <Skeleton
              color="text_secondary"
              fontWeight="400"
              isLoaded={ !isLoading }
            >
              <span>{ timeAgo }</span>
            </Skeleton>
          ) }
        </VStack>
      </Td>
      <Td whiteSpace="nowrap">
        <StakingTxType isLoading={ isLoading } data={ tx.type }/>
      </Td>
      <Td>
        <BlockEntity
          isLoading={ isLoading }
          number={ tx.block }
          noIcon
          fontSize="sm"
          lineHeight={ 6 }
          fontWeight={ 500 }
        />
      </Td>
      <Td>
        { tx.msg_validator_address ? (
          <AddressEntity
            address={{
              hash: tx.msg_validator_address,
            }}
            isLoading={ isLoading }
            truncation="constant"
            noCopy
          />
        ) : (
          ''
        ) }
      </Td>
      <Td>
        <AddressFromTo
          from={ tx.from }
          to={ null }
          current={ currentAddress }
          isLoading={ isLoading }
          mt="2px"
          mode="compact"
        />
      </Td>
    </Tr>
  );
};

export default React.memo(StakingTxsTableItem);
