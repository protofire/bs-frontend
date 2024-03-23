import type { LinkProps, FlexProps } from '@chakra-ui/react';
import { Flex, Link } from '@chakra-ui/react';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import type { LegacyRef } from 'react';
import React from 'react';

import { getFeaturePayload } from 'configs/app/features/types';

import config from 'configs/app';

const LinkInternal = ({ isLoading, ...props }: LinkProps & { isLoading?: boolean }, ref: LegacyRef<HTMLAnchorElement>) => {
  const { query } = useRouter();

  if (isLoading) {
    return <Flex alignItems="center" { ...props as FlexProps }>{ props.children }</Flex>;
  }

  if (!props.href) {
    return <Link { ...props } ref={ ref }/>;
  }

  if (config.features.shards.isEnabled) {
    const shards = getFeaturePayload(config.features.shards)?.shards;
    const shardablePages = getFeaturePayload(config.features.shards)?.pages;
    const isShardable = shardablePages?.find((page) => props.href?.startsWith(page)) !== undefined;

    if (isShardable && shards && Object.keys(shards).length) {
      // Add shard to the first URL segment
      const shardId = query.shard || Object.keys(shards)[0];
      const url = new URL(props.href as string, 'http://localhost:8080');
      url.pathname = `/${ shardId }${ url.pathname }`;
      props.href = url.toString();
    }
  }

  return (
    <NextLink href={ props.href as NextLinkProps['href'] } passHref target={ props.target } legacyBehavior>
      <Link { ...props } ref={ ref }/>
    </NextLink>
  );
};

export default React.memo(React.forwardRef(LinkInternal));
