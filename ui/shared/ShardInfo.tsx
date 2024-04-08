import { Flex, Text, Link } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';

type ShardInfoProps = {
  shardID?: string;
  toShardID?: string;
};

const ShardInfo: React.FC<ShardInfoProps> = ({ shardID, toShardID }) => {
  const router = useRouter();

  const setActiveShardId = useCallback(
    (shardID?: string) => async() => {
      if (shardID === undefined) {
        return;
      }

      await router.push({
        pathname: '/txs',
        query: { shard: `s${ shardID }` },
      });
      router.reload();
    },
    [ router ],
  );

  return (
    <Flex>
      <Text>
        <Link onClick={ setActiveShardId(shardID) }>{ shardID }</Link>
         &nbsp;&gt;&nbsp;
        <Link onClick={ setActiveShardId(toShardID) }>{ toShardID }</Link>
      </Text>
    </Flex>
  );
};

export default ShardInfo;
