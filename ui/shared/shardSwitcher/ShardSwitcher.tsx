import { chakra } from '@chakra-ui/react';
import React from 'react';

import type { ShardId, ShardInfo } from 'types/shards';

import useShards from 'lib/hooks/useShards';

import RadioButtonGroup from '../radioButtonGroup/RadioButtonGroup';

type ShardSwitcherProps = {
  shardId: ShardId;
  shards: Record<ShardId, ShardInfo>;
};

const ShardSwitcher = ({ shardId, shards }: ShardSwitcherProps) => {
  const { setActiveShardId } = useShards();
  const options = React.useMemo(() => {
    const allShards = shards || {};

    return Object.keys(allShards).map((shardId) => ({
      title: allShards[shardId].title,
      value: shardId,
      onlyIcon: false as const,
    }));
  }, [ shards ]);

  const handleSelectShard = React.useCallback(async(shardId: string) => {
    await setActiveShardId(shardId);
  }, [ setActiveShardId ]);

  return (
    <RadioButtonGroup<string>
      onChange={ handleSelectShard }
      defaultValue={ shardId as string }
      name="type"
      options={ options }
    />
  );
};

export default React.memo(chakra(ShardSwitcher));
