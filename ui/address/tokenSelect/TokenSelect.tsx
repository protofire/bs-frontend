import { Box, Icon, IconButton, Skeleton, Tooltip } from '@chakra-ui/react';
import { useQuery, useQueryClient, useIsFetching } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';

import type { SocketMessage } from 'lib/socket/types';
import type { Address, AddressTokenBalance } from 'types/api/address';
import { QueryKeys } from 'types/client/queries';

import walletIcon from 'icons/wallet.svg';
import useFetch from 'lib/hooks/useFetch';
import useIsMobile from 'lib/hooks/useIsMobile';
import useSocketChannel from 'lib/socket/useSocketChannel';
import useSocketMessage from 'lib/socket/useSocketMessage';

import TokenSelectDesktop from './TokenSelectDesktop';
import TokenSelectMobile from './TokenSelectMobile';

const TokenSelect = () => {
  const router = useRouter();
  const fetch = useFetch();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [ blockNumber, setBlockNumber ] = React.useState<number>();

  const addressQueryData = queryClient.getQueryData<Address>([ QueryKeys.address, router.query.id ]);

  const { data, isError, isLoading, refetch } = useQuery<unknown, unknown, Array<AddressTokenBalance>>(
    [ QueryKeys.addressTokenBalances, addressQueryData?.hash ],
    async() => await fetch(`/node-api/addresses/${ addressQueryData?.hash }/token-balances`),
    {
      enabled: Boolean(addressQueryData),
    },
  );
  const balancesIsFetching = useIsFetching({ queryKey: [ QueryKeys.addressTokenBalances, addressQueryData?.hash ] });

  const handleTokenBalanceMessage: SocketMessage.AddressTokenBalance['handler'] = React.useCallback((payload) => {
    if (payload.block_number !== blockNumber) {
      refetch();
      setBlockNumber(payload.block_number);
    }
  }, [ blockNumber, refetch ]);
  const handleCoinBalanceMessage: SocketMessage.AddressCoinBalance['handler'] = React.useCallback((payload) => {
    if (payload.coin_balance.block_number !== blockNumber) {
      refetch();
      setBlockNumber(payload.coin_balance.block_number);
    }
  }, [ blockNumber, refetch ]);

  const channel = useSocketChannel({
    topic: `addresses:${ addressQueryData?.hash.toLowerCase() }`,
    isDisabled: !addressQueryData,
  });
  useSocketMessage({
    channel,
    event: 'coin_balance',
    handler: handleCoinBalanceMessage,
  });
  useSocketMessage({
    channel,
    event: 'token_balance',
    handler: handleTokenBalanceMessage,
  });

  if (isLoading) {
    return <Skeleton h={ 8 } w="160px"/>;
  }

  if (isError || data.length === 0) {
    return <Box py="6px">0</Box>;
  }

  return (
    <>
      { isMobile ?
        <TokenSelectMobile data={ data } isLoading={ balancesIsFetching === 1 }/> :
        <TokenSelectDesktop data={ data } isLoading={ balancesIsFetching === 1 }/>
      }
      <Tooltip label="Show all tokens">
        <IconButton
          aria-label="Show all tokens"
          variant="outline"
          size="sm"
          pl="6px"
          pr="6px"
          ml={ 3 }
          icon={ <Icon as={ walletIcon } boxSize={ 5 }/> }
        />
      </Tooltip>
    </>
  );
};

export default React.memo(TokenSelect);