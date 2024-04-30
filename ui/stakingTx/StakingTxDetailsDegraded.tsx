import { Flex } from '@chakra-ui/react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { hexToNumber } from 'viem';
import type { TransactionReceipt, RpcStakingTransaction } from 'viem';

import type { StakingTransaction } from 'types/api/stakingTransaction';

import type { ResourceError } from 'lib/api/resources';
import { SECOND } from 'lib/consts';
import dayjs from 'lib/date/dayjs';
import { publicClient } from 'lib/web3/client';
import { unknownAddress } from 'ui/shared/address/utils';
import ServiceDegradationWarning from 'ui/shared/alerts/ServiceDegradationWarning';
import TestnetWarning from 'ui/shared/alerts/TestnetWarning';
import DataFetchAlert from 'ui/shared/DataFetchAlert';

import StakingTxInfo from './StakingTxInfo';

type RpcResponseType = [RpcStakingTransaction, TransactionReceipt | null];

interface Props {
  hash: string;
  query: UseQueryResult<StakingTransaction, ResourceError<unknown>>;
}

const StakingTxDetailsDegraded = ({ hash, query }: Props) => {
  const [ originalError ] = React.useState(query.error);

  const queryRpc = useQuery<
  RpcResponseType,
  unknown,
  StakingTransaction | null
  >({
    queryKey: [ 'RPC', 'staking_tx', { hash } ],
    queryFn: async() => {
      if (!publicClient) {
        throw new Error('No public RPC client');
      }

      const tx = await publicClient.request({
        method: 'hmy_getStakingTransactionByHash',
        params: [ hash as `0x${ string }` ],
      });

      if (!tx) {
        throw new Error('Not found');
      }

      const txReceipt = await publicClient
        .getTransactionReceipt({ hash: hash as `0x${ string }` })
        .catch(() => null);

      return [ tx, txReceipt ];
    },
    select: (response) => {
      const [ tx, txReceipt ] = response;

      const status = (() => {
        if (!txReceipt) {
          return null;
        }

        return txReceipt.status === 'success' ? 'ok' : 'error';
      })();
      const stakingTrx = {
        hash: tx.hash as string,
        nonce: hexToNumber(tx.nonce),
        block: tx.blockNumber ? Number(tx.blockNumber) : null,
        timestamp: tx.timestamp ? dayjs.unix(hexToNumber(tx.timestamp)).format() : 0,
        from: { ...unknownAddress, hash: tx.from as string },
        gas_price: tx.gasPrice.toString(),
        gas: tx.gas as string,
        gas_used: txReceipt?.gasUsed.toString(),
        comulative_gas_used: txReceipt?.cumulativeGasUsed.toString(),
        status: status,
        type: tx.type,
        transaction_index: tx.transactionIndex ?
          hexToNumber(tx.transactionIndex) :
          0,
        msg_validator_address: tx.msg?.validatorAddress,
        msg_name: tx.msg?.name,
        msg_commission_rate: tx.msg?.commissionRate?.toString(),
        msg_max_commission_rate: tx.msg?.maxCommissionRate?.toString(),
        msg_max_change_rate: tx.msg?.maxChangeRate?.toString(),
        msg_min_self_delegation: tx.msg?.minSelfDelegation?.toString(),
        msg_max_total_delegation: tx.msg?.maxTotalDelegation?.toString(),
        msg_amount: tx.msg?.amount?.toString(),
        msg_website: tx.msg?.website,
        msg_identity: tx.msg?.identity,
        msg_security_contact: tx.msg?.securityContact,
        msg_details: tx.msg?.details,
        msg_slot_pub_keys: tx.msg?.slotPubKeys,
        msg_delegator_address: tx.msg?.delegatorAddress,
        msg_slot_pub_key_to_remove: tx.msg?.slotPubKeyToRemove,
        msg_slot_pub_key_to_add: tx.msg?.slotPubKeyToAdd,
      } as StakingTransaction;
      return stakingTrx;
    },
    refetchOnMount: false,
    enabled: !query.isPlaceholderData,
    retry: 2,
    retryDelay: 5 * SECOND,
  });

  if (!queryRpc.data) {
    if (originalError?.status === 404) {
      throw Error('Not found', { cause: { status: 404 } as unknown as Error });
    }

    return <DataFetchAlert/>;
  }

  return (
    <>
      <Flex rowGap={ 2 } mb={ 6 } flexDir="column">
        <TestnetWarning isLoading={ queryRpc.isPlaceholderData }/>
        { originalError?.status !== 404 && (
          <ServiceDegradationWarning isLoading={ query.isPlaceholderData }/>
        ) }
      </Flex>
      <StakingTxInfo
        data={ queryRpc.data }
        isLoading={ queryRpc.isPlaceholderData }
      />
    </>
  );
};

export default React.memo(StakingTxDetailsDegraded);
