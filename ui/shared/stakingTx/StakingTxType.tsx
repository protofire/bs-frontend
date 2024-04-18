import { Skeleton, Text, chakra } from '@chakra-ui/react';
import React from 'react';

interface Props {
  data: string;
  isLoading?: boolean;
}

const StakingTxType = ({ data, isLoading }: Props) => {
  const type = React.useMemo(() => {
    switch (data) {
      case 'create_validator':
        return 'Create Validator';
      case 'edit_validator':
        return 'Edit Validator';
      case 'collect_rewards':
        return 'Collect Rewards';
      case 'undelegate':
        return 'Undelegate';
      case 'delegate':
        return 'Delegate';
      default:
        return data;
    }
  }, [ data ]);

  return (
    <Skeleton whiteSpace="pre" isLoaded={ !isLoading } display="flex">
      <Text>{ type } </Text>
    </Skeleton>
  );
};

export default React.memo(chakra(StakingTxType));
