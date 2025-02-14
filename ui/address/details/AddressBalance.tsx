import { useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import React from 'react';

import type { SocketMessage } from 'lib/socket/types';
import type { Address } from 'types/api/address';
import type { StakingApi } from 'types/api/stakingApi';

import config from 'configs/app';
import { getResourceKey } from 'lib/api/useApiQuery';
import useSocketChannel from 'lib/socket/useSocketChannel';
import useSocketMessage from 'lib/socket/useSocketMessage';
import { currencyUnits } from 'lib/units';
import CurrencyValue from 'ui/shared/CurrencyValue';
import DetailsInfoItem from 'ui/shared/DetailsInfoItem';

interface Props {
  data: Pick<Address, 'block_number_balance_updated_at' | 'coin_balance' | 'hash' | 'exchange_rate'>;
  isLoading: boolean;
  stakingData?: Array<StakingApi>;
}

interface AddressBalance {
  liquidBalance: string;
  stakedBalance: string;
  unstakedBalance: string;
  rewardBalance: string;
  totalBalance: string;
}

const initialAddressBalance: AddressBalance = {
  liquidBalance: '0',
  stakedBalance: '0',
  unstakedBalance: '0',
  rewardBalance: '0',
  totalBalance: '0',
};

const AddressBalance = ({ data, isLoading, stakingData }: Props) => {
  const [ lastBlockNumber, setLastBlockNumber ] = React.useState<number>(data.block_number_balance_updated_at || 0);
  const [ addressBalances, setAddressBalances ] = React.useState<AddressBalance>(initialAddressBalance);
  const queryClient = useQueryClient();

  const updateData = React.useCallback(
    (balance: string, exchangeRate: string, blockNumber: number) => {
      if (blockNumber < lastBlockNumber) {
        return;
      }

      setLastBlockNumber(blockNumber);
      const queryKey = getResourceKey('address', { pathParams: { hash: data.hash } });
      queryClient.setQueryData(queryKey, (prevData: Address | undefined) => {
        if (!prevData) {
          return;
        }
        return {
          ...prevData,
          coin_balance: balance,
          exchange_rate: exchangeRate,
          block_number_balance_updated_at: blockNumber,
        };
      });
    },
    [ data.hash, lastBlockNumber, queryClient ],
  );

  const handleNewBalanceMessage: SocketMessage.AddressBalance['handler'] = React.useCallback(
    (payload) => {
      updateData(payload.balance, payload.exchange_rate, payload.block_number);
    },
    [ updateData ],
  );

  const handleNewCoinBalanceMessage: SocketMessage.AddressCurrentCoinBalance['handler'] = React.useCallback(
    (payload) => {
      updateData(payload.coin_balance, payload.exchange_rate, payload.block_number);
    },
    [ updateData ],
  );

  const calculateBalances = (liquidBalance: string | null, stakingData: Array<StakingApi>) => {
    const balances = {
      liquidBalance: liquidBalance ? liquidBalance : '0',
      stakedBalance: '0',
      unstakedBalance: '0',
      rewardBalance: '0',
      totalBalance: '0',
    };

    stakingData.forEach((delegation) => {
      if (delegation.amount) {
        balances.stakedBalance = BigNumber.sum(balances.stakedBalance, delegation.amount).toString();
      }

      if (delegation.reward) {
        balances.rewardBalance = BigNumber.sum(balances.rewardBalance, delegation.reward).toString();
      }

      if (delegation.Undelegations && delegation.Undelegations?.length > 0) {
        delegation.Undelegations.forEach((unstake) => {
          balances.unstakedBalance = BigNumber.sum(balances.unstakedBalance, unstake.Amount).toString();
        });
      }
    });

    balances.totalBalance = BigNumber.sum(
      balances.liquidBalance,
      balances.stakedBalance,
      balances.unstakedBalance,
    ).toString();

    return balances;
  };

  const channel = useSocketChannel({
    topic: `addresses:${ data.hash.toLowerCase() }`,
    isDisabled: !data.coin_balance,
  });
  useSocketMessage({
    channel,
    event: 'balance',
    handler: handleNewBalanceMessage,
  });
  useSocketMessage({
    channel,
    event: 'current_coin_balance',
    handler: handleNewCoinBalanceMessage,
  });

  React.useEffect(() => {
    setAddressBalances(initialAddressBalance);

    if (stakingData) {
      setAddressBalances((prevState) => {
        return { ...prevState, ...calculateBalances(data.coin_balance, stakingData) };
      });
    }
  }, [ data.coin_balance, stakingData ]);

  return (
    <>
      <DetailsInfoItem
        title={ stakingData && stakingData.length > 0 ? 'Liquid Balance' : 'Balance' }
        hint={ `Address balance in ${ currencyUnits.ether }. Doesn't include staking, ERC20, ERC721 and ERC1155 tokens` }
        flexWrap="nowrap"
        alignItems="flex-start"
        isLoading={ isLoading }
      >
        <CurrencyValue
          value={ data.coin_balance }
          exchangeRate={ data.exchange_rate }
          decimals={ String(config.chain.currency.decimals) }
          currency={ currencyUnits.ether }
          accuracyUsd={ 2 }
          accuracy={ 8 }
          flexWrap="wrap"
          isLoading={ isLoading }
        />
      </DetailsInfoItem>
      { stakingData && stakingData.length > 0 && (
        <>
          <DetailsInfoItem
            title="Reward Balance"
            hint={ `Address reward balance in ${ currencyUnits.ether }.` }
            flexWrap="nowrap"
            alignItems="flex-start"
            isLoading={ isLoading }
          >
            <CurrencyValue
              value={ addressBalances.rewardBalance }
              exchangeRate={ data.exchange_rate }
              decimals={ String(config.chain.currency.decimals) }
              currency={ currencyUnits.ether }
              accuracyUsd={ 2 }
              accuracy={ 8 }
              flexWrap="wrap"
              isLoading={ isLoading }
            />
          </DetailsInfoItem>
          <DetailsInfoItem
            title="Staked Balance"
            hint={ `Address staked balance in ${ currencyUnits.ether }.` }
            flexWrap="nowrap"
            alignItems="flex-start"
            isLoading={ isLoading }
          >
            <CurrencyValue
              value={ addressBalances.stakedBalance }
              exchangeRate={ data.exchange_rate }
              decimals={ String(config.chain.currency.decimals) }
              currency={ currencyUnits.ether }
              accuracyUsd={ 2 }
              accuracy={ 8 }
              flexWrap="wrap"
              isLoading={ isLoading }
            />
          </DetailsInfoItem>
          <DetailsInfoItem
            title="Pending Unstaked"
            hint={ `Address pending unstake balance in ${ currencyUnits.ether }.` }
            flexWrap="nowrap"
            alignItems="flex-start"
            isLoading={ isLoading }
          >
            <CurrencyValue
              value={ addressBalances.unstakedBalance }
              exchangeRate={ data.exchange_rate }
              decimals={ String(config.chain.currency.decimals) }
              currency={ currencyUnits.ether }
              accuracyUsd={ 2 }
              accuracy={ 8 }
              flexWrap="wrap"
              isLoading={ isLoading }
            />
          </DetailsInfoItem>
          <DetailsInfoItem
            title={ `Total ${ currencyUnits.ether } Balance` }
            hint={ `Address total balance in ${ currencyUnits.ether } including staked balances. Doesn't include ERC20, ERC721 and ERC1155 tokens` }
            flexWrap="nowrap"
            alignItems="flex-start"
            isLoading={ isLoading }
          >
            <CurrencyValue
              value={ addressBalances.totalBalance }
              exchangeRate={ data.exchange_rate }
              decimals={ String(config.chain.currency.decimals) }
              currency={ currencyUnits.ether }
              accuracyUsd={ 2 }
              accuracy={ 8 }
              flexWrap="wrap"
              isLoading={ isLoading }
            />
          </DetailsInfoItem>
        </>
      ) }
    </>
  );
};

export default React.memo(AddressBalance);
