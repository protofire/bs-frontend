import { Flex, Text, Link } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';

type ShardInfoProps = {
  shardId?: string;
  toShardId?: string;
};

const ShardInfo: React.FC<ShardInfoProps> = ({ shardId, toShardId }) => {
  const router = useRouter();

  const setActiveShardId = useCallback(
    (shardId?: string) => async() => {
      if (shardId === undefined) {
        return;
      }

      await router.push(
        {
          pathname: '/txs',
          query: { shard: shardId },
        },
        undefined,
        { shallow: true },
      );
    },
    [ router ],
  );

  return (
    <Flex>
      <Text>
        <Link onClick={ setActiveShardId(shardId) }>{ shardId }</Link>
        &nbsp;&gt;&nbsp;
        <Link onClick={ setActiveShardId(toShardId) }>{ toShardId }</Link>
      </Text>
    </Flex>
  );
};

export default ShardInfo;
