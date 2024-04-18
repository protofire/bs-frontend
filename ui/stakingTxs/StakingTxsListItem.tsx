import { Flex, Skeleton } from '@chakra-ui/react';
import React from 'react';

import type { StakingTransaction } from 'types/api/stakingTransaction';

import useTimeAgoIncrement from 'lib/hooks/useTimeAgoIncrement';
import AddressFromTo from 'ui/shared/address/AddressFromTo';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import StakingTxEntity from 'ui/shared/entities/stakingTx/StakingTxEntity';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';
import StakingTxType from 'ui/shared/stakingTx/StakingTxType';

type Props = {
  tx: StakingTransaction;
  currentAddress?: string;
  isLoading?: boolean;
};

const StakingTxsListItem = ({ tx, isLoading, currentAddress }: Props) => {
  const timeAgo = useTimeAgoIncrement(tx.timestamp);

  return (
    <ListItemMobile display="block" width="100%" isAnimated key={ tx.hash }>
      <Flex
        justifyContent="space-between"
        lineHeight="24px"
        mt={ 3 }
        alignItems="center"
      >
        <StakingTxEntity
          isLoading={ isLoading }
          hash={ tx.hash }
          truncation="constant_long"
          fontWeight="700"
        />
        { tx.timestamp && (
          <Skeleton
            isLoaded={ !isLoading }
            color="text_secondary"
            fontWeight="400"
            fontSize="sm"
          >
            <span>{ timeAgo }</span>
          </Skeleton>
        ) }
      </Flex>
      <Flex
        justifyContent="space-between"
        lineHeight="24px"
        mt={ 2 }
        alignItems="center"
      >
        <Flex mt={ 2 }>
          <Skeleton
            isLoaded={ !isLoading }
            display="inline-block"
            whiteSpace="pre"
          >
            Type{ ' ' }
          </Skeleton>
          <StakingTxType isLoading={ isLoading } data={ tx.type }/>
        </Flex>
      </Flex>
      <Flex mt={ 0 }>
        <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">
          Block{ ' ' }
        </Skeleton>
        <BlockEntity isLoading={ isLoading } number={ tx.block } noIcon/>
      </Flex>
      <Flex mt={ 0 }>
        <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">
          Validator{ ' ' }
        </Skeleton>
        { tx.msg_validator_address ? (
          <AddressEntity
            address={{
              hash: tx.msg_validator_address,
            }}
            isLoading={ isLoading }
            truncation="constant"
            noIcon
            noCopy
          />
        ) : (
          ''
        ) }
      </Flex>
      <AddressFromTo
        from={ tx.from }
        to={ null }
        current={ currentAddress }
        isLoading={ isLoading }
        fontWeight="500"
        mt={ 6 }
      />
    </ListItemMobile>
  );
};

export default React.memo(StakingTxsListItem);
