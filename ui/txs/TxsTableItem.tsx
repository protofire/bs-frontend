import { Tr, Td, VStack, Skeleton, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

import type { Transaction } from 'types/api/transaction';

import config from 'configs/app';
import { toBech32 } from 'lib/formatting/formatAddress';
import useTimeAgoIncrement from 'lib/hooks/useTimeAgoIncrement';
import AddressFromTo from 'ui/shared/address/AddressFromTo';
import Tag from 'ui/shared/chakra/Tag';
import CurrencyValue from 'ui/shared/CurrencyValue';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';
import IconSvg from 'ui/shared/IconSvg';
import ShardInfo from 'ui/shared/ShardInfo';
import TxStatus from 'ui/shared/statusTag/TxStatus';
import TxFeeStability from 'ui/shared/tx/TxFeeStability';
import TxWatchListTags from 'ui/shared/tx/TxWatchListTags';
import useTxMethod from 'ui/tx/useTxMethod';
import TxAdditionalInfo from 'ui/txs/TxAdditionalInfo';

import TxType from './TxType';

type Props = {
  tx: Transaction;
  showBlockInfo: boolean;
  currentAddress?: string;
  enableTimeIncrement?: boolean;
  isLoading?: boolean;
};

const CopyIcon = ({
  tx,
  isLoading,
}: {
  tx: Transaction;
  isLoading?: boolean;
}) => {
  const handleClick = React.useCallback(() => {
    navigator.clipboard.writeText(
      `${ toBech32(tx.hash) },${ tx.hash },${ tx.block },${ tx.timestamp },${ tx.from.hash },${
        tx.to?.hash || tx.created_contract?.hash
      },${ tx.type },${ tx.value },${ tx.fee.value },${ tx.status },${
        tx.revert_reason || 'N/A'
      },${ tx.exchange_rate }`,
    );
  }, [ tx.block, tx.created_contract, tx.exchange_rate, tx.fee, tx.from, tx.hash, tx.revert_reason, tx.status, tx.timestamp, tx.to, tx.type, tx.value ]);

  if (isLoading) {
    return <Skeleton boxSize={ 6 } borderRadius="sm" flexShrink={ 0 }/>;
  }

  return (
    <Button
      variant="unstyled"
      display="inline-flex"
      alignItems="center"
      borderRadius="8px"
      w="24px"
      h="24px"
      onClick={ handleClick }
      cursor="pointer"
      ml={ 2 }
      flexShrink={ 0 }
      aria-label="Transaction info"
    >
      <IconSvg
        name="copy"
        boxSize={ 5 }
        color="link"
        _hover={{ color: 'link_hovered' }}
      />
    </Button>
  );
};

const TxsTableItem = ({
  tx,
  showBlockInfo,
  currentAddress,
  enableTimeIncrement,
  isLoading,
}: Props) => {
  const dataTo = tx.to ? tx.to : tx.created_contract;
  const timeAgo = useTimeAgoIncrement(tx.timestamp, enableTimeIncrement);

  const method = useTxMethod(tx);

  return (
    <Tr
      as={ motion.tr }
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transitionDuration="normal"
      transitionTimingFunction="linear"
      key={ tx.hash }
    >
      <Td pl={ 4 }>
        <VStack alignItems="center">
          <TxAdditionalInfo tx={ tx } isLoading={ isLoading }/>
          <CopyIcon tx={ tx } isLoading={ isLoading }/>
        </VStack>
      </Td>
      <Td pr={ 4 }>
        <VStack alignItems="start" lineHeight="24px">
          <Skeleton isLoaded={ !isLoading }>
            <ShardInfo shardId={ tx.shard_id } toShardId={ tx.to_shard_id }/>
          </Skeleton>
        </VStack>
      </Td>
      <Td pr={ 4 }>
        <VStack alignItems="start" lineHeight="24px">
          <TxEntity
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
      <Td>
        <VStack alignItems="start">
          <TxType types={ tx.tx_types } isLoading={ isLoading }/>
          <TxStatus
            status={ tx.status }
            errorText={ tx.status === 'error' ? tx.result : undefined }
            isLoading={ isLoading }
          />
          <TxWatchListTags tx={ tx } isLoading={ isLoading }/>
        </VStack>
      </Td>
      <Td whiteSpace="nowrap">
        { method && (
          <Tag
            colorScheme={ method === 'Multicall' ? 'teal' : 'gray' }
            isLoading={ isLoading }
            isTruncated
          >
            { method }
          </Tag>
        ) }
      </Td>
      { showBlockInfo && (
        <Td>
          { tx.block && (
            <BlockEntity
              isLoading={ isLoading }
              number={ tx.block }
              noIcon
              fontSize="sm"
              lineHeight={ 6 }
              fontWeight={ 500 }
            />
          ) }
        </Td>
      ) }
      <Td>
        <AddressFromTo
          from={ tx.from }
          to={ dataTo }
          current={ currentAddress }
          isLoading={ isLoading }
          mt="2px"
          mode="compact"
        />
      </Td>
      { !config.UI.views.tx.hiddenFields?.value && (
        <Td isNumeric>
          <CurrencyValue value={ tx.value } accuracy={ 8 } isLoading={ isLoading }/>
        </Td>
      ) }
      { !config.UI.views.tx.hiddenFields?.tx_fee && (
        <Td isNumeric>
          { /* eslint-disable-next-line no-nested-ternary */ }
          { tx.stability_fee ? (
            <TxFeeStability
              data={ tx.stability_fee }
              isLoading={ isLoading }
              accuracy={ 8 }
              justifyContent="end"
              hideUsd
            />
          ) : tx.fee.value ? (
            <CurrencyValue
              value={ tx.fee.value }
              accuracy={ 8 }
              isLoading={ isLoading }
            />
          ) : (
            '-'
          ) }
        </Td>
      ) }
    </Tr>
  );
};

export default React.memo(TxsTableItem);
