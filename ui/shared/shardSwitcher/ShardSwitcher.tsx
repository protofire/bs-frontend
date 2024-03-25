import { chakra } from '@chakra-ui/react';
import React from 'react';

import type { ShardId, ShardInfo } from 'types/shards';

import RadioButtonGroup from '../radioButtonGroup/RadioButtonGroup';

type ShardSwitcherProps = {
  shardId: ShardId; shards: Record<ShardId, ShardInfo>; handleSwitchShard: (shardId: ShardId) => void;
};

const ShardSwitcher = ({ shardId, shards, handleSwitchShard }: ShardSwitcherProps) => {
  const options = React.useMemo(() => {
    const allShards = shards || {};

    return Object.keys(allShards).map((shardId) => ({
      title: allShards[shardId].title,
      value: shardId,
      onlyIcon: false as const,
    }));
  }, [ shards ]);

  return (
    <RadioButtonGroup<string>
      onChange={ handleSwitchShard }
      defaultValue={ shardId as string }
      name="type"
      options={ options }
    />
  );
};

export default React.memo(chakra(ShardSwitcher));
