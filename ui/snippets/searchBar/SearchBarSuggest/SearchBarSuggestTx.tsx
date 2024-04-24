import { chakra, Text, Flex } from '@chakra-ui/react';
import React from 'react';

import type { SearchResultTx } from 'types/api/search';

import dayjs from 'lib/date/dayjs';
import * as TxEntity from 'ui/shared/entities/tx/TxEntity';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';

interface Props {
  data: SearchResultTx;
  isMobile: boolean | undefined;
  searchTerm: string;
}

const SearchBarSuggestTx = ({ data, isMobile, searchTerm }: Props) => {
  const isUseHash = React.useMemo(() => {
    return data.tx_hash.toLowerCase().includes(searchTerm.toLowerCase());
  }, [ data, searchTerm ]);

  const icon = <TxEntity.Icon/>;
  const hash = (
    <chakra.mark overflow="hidden" whiteSpace="nowrap" fontWeight={ 700 }>
      <HashStringShortenDynamic
        hash={ isUseHash ? data.tx_hash : data.tx_eth_hash }
        isTooltipDisabled
      />
    </chakra.mark>
  );
  const date = dayjs(data.timestamp).format('llll');

  if (isMobile) {
    return (
      <>
        <Flex alignItems="center">
          { icon }
          { hash }
        </Flex>
        <Text variant="secondary">{ date }</Text>
      </>
    );
  }

  return (
    <Flex columnGap={ 2 }>
      <Flex alignItems="center" minW={ 0 }>
        { icon }
        { hash }
      </Flex>
      <Text variant="secondary" textAlign="end" flexShrink={ 0 } ml="auto">
        { date }
      </Text>
    </Flex>
  );
};

export default React.memo(SearchBarSuggestTx);
