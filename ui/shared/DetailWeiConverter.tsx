import { Skeleton } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React from 'react';

import { WEI, WEI_IN_GWEI } from 'lib/consts';
import { currencyUnits } from 'lib/units';
import DetailsInfoItem from 'ui/shared/DetailsInfoItem';

interface Props {
  title: string;
  hint: string;
  value: string;
  isLoading?: boolean;
}

const DetailWeiConverter = ({ title, hint, value, isLoading }: Props) => {
  return (
    <DetailsInfoItem title={ title } hint={ hint } isLoading={ isLoading }>
      <Skeleton isLoaded={ !isLoading } mr={ 1 }>
        { BigNumber(value).dividedBy(WEI).toFixed() } { currencyUnits.ether }
      </Skeleton>
      <Skeleton isLoaded={ !isLoading } color="text_secondary">
        <span>
          ({ BigNumber(value).dividedBy(WEI_IN_GWEI).toFixed() }{ ' ' }
          { currencyUnits.gwei })
        </span>
      </Skeleton>
    </DetailsInfoItem>
  );
};

export default React.memo(DetailWeiConverter);
