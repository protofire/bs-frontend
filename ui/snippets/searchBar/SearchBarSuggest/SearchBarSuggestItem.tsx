import { Box, Text } from '@chakra-ui/react';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';
import React from 'react';

import type { SearchResultItem } from 'types/api/search';

import { route } from 'nextjs-routes';

import useShards from 'lib/hooks/useShards';

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
  const { shards } = useShards();

  const url = (() => {
    switch (data.type) {
      case 'token': {
        return route({ pathname: '/token/[hash]', query: { hash: data.address, shard: data.shard_id } });
      }
      case 'contract':
      case 'address':
      case 'label': {
        return route({ pathname: '/address/[hash]', query: { hash: data.address, shard: data.shard_id } });
      }
      case 'transaction': {
        return route({ pathname: '/tx/[hash]', query: { hash: data.tx_hash, shard: data.shard_id } });
      }
      case 'block': {
        return route({ pathname: '/block/[height_or_hash]', query: { height_or_hash: String(data.block_hash), shard: data.shard_id } });
      }
      case 'user_operation': {
        return route({ pathname: '/op/[hash]', query: { hash: data.user_operation_hash, shard: data.shard_id } });
      }
      case 'blob': {
        return route({ pathname: '/blobs/[hash]', query: { hash: data.blob_hash, shard: data.shard_id } });
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
        { data.shard_id ? (
          <Box>
            <Text size="xs">
              { shards[data.shard_id].title }
            </Text>
          </Box>
        ) : null }
        { content }
      </SearchBarSuggestItemLink>
    </NextLink>
  );
};

export default React.memo(SearchBarSuggestItem);
