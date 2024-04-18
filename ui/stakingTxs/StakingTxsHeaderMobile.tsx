import { HStack, chakra } from '@chakra-ui/react';
import React from 'react';

import type { PaginationParams } from 'ui/shared/pagination/types';

import ActionBar from 'ui/shared/ActionBar';
import Pagination from 'ui/shared/pagination/Pagination';

type Props = {
  paginationProps: PaginationParams;
  className?: string;
  showPagination?: boolean;
  linkSlot?: React.ReactNode;
}

const StakingTxsHeaderMobile = ({ paginationProps, className, showPagination = true, linkSlot }: Props) => {
  return (
    <ActionBar className={ className }>
      <HStack>
        { linkSlot }
      </HStack>
      { showPagination && <Pagination { ...paginationProps }/> }
    </ActionBar>
  );
};

export default chakra(StakingTxsHeaderMobile);
