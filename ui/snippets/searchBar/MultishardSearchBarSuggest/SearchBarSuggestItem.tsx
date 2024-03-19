import { Box, Text } from '@chakra-ui/react';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';
import React from 'react';

import type { SearchResultItem } from 'types/api/search';

import { route } from 'nextjs-routes';

import SearchBarSuggestAddress from './SearchBarSuggestAddress';
import SearchBarSuggestBlob from './SearchBarSuggestBlob';
import SearchBarSuggestBlock from './SearchBarSuggestBlock';
import SearchBarSuggestItemLink from './SearchBarSuggestItemLink';
import SearchBarSuggestLabel from './SearchBarSuggestLabel';
import SearchBarSuggestToken from './SearchBarSuggestToken';
import SearchBarSuggestTx from './SearchBarSuggestTx';
import SearchBarSuggestUserOp from './SearchBarSuggestUserOp';

interface Props {
  data: SearchResultItem;
  isMobile: boolean | undefined;
  searchTerm: string;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const SearchBarSuggestItem = ({ data, isMobile, searchTerm, onClick }: Props) => {

  const url = (() => {
    switch (data.type) {
      case 'token': {
        return data.shard?.url + route({ pathname: '/token/[hash]', query: { hash: data.address } });
      }
      case 'contract':
      case 'address':
      case 'label': {
        return data.shard?.url + route({ pathname: '/address/[hash]', query: { hash: data.address } });
      }
      case 'transaction': {
        return data.shard?.url + route({ pathname: '/tx/[hash]', query: { hash: data.tx_hash } });
      }
      case 'block': {
        return data.shard?.url + route({ pathname: '/block/[height_or_hash]', query: { height_or_hash: String(data.block_hash) } });
      }
      case 'user_operation': {
        return data.shard?.url + route({ pathname: '/op/[hash]', query: { hash: data.user_operation_hash } });
      }
      case 'blob': {
        return data.shard?.url + route({ pathname: '/blobs/[hash]', query: { hash: data.blob_hash } });
      }
    }
  })();

  const content = (() => {
    switch (data.type) {
      case 'token': {
        return <SearchBarSuggestToken data={ data } searchTerm={ searchTerm } isMobile={ isMobile }/>;
      }
      case 'contract':
      case 'address': {
        return <SearchBarSuggestAddress data={ data } searchTerm={ searchTerm } isMobile={ isMobile }/>;
      }
      case 'label': {
        return <SearchBarSuggestLabel data={ data } searchTerm={ searchTerm } isMobile={ isMobile }/>;

      }
      case 'block': {
        return <SearchBarSuggestBlock data={ data } searchTerm={ searchTerm } isMobile={ isMobile }/>;
      }
      case 'transaction': {
        return <SearchBarSuggestTx data={ data } searchTerm={ searchTerm } isMobile={ isMobile }/>;
      }
      case 'user_operation': {
        return <SearchBarSuggestUserOp data={ data } searchTerm={ searchTerm } isMobile={ isMobile }/>;
      }
      case 'blob': {
        return <SearchBarSuggestBlob data={ data } searchTerm={ searchTerm }/>;
      }
    }
  })();

  return (
    <NextLink href={ url as NextLinkProps['href'] } passHref legacyBehavior>
      <SearchBarSuggestItemLink onClick={ onClick }>
        <Box>
          <Text size="xs" p="0.5">{ data.shard?.title }</Text>
        </Box>
        { content }
      </SearchBarSuggestItemLink>
    </NextLink>
  );
};

export default React.memo(SearchBarSuggestItem);
