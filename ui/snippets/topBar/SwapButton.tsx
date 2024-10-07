import { Button, Box } from '@chakra-ui/react';
import React from 'react';

import IconSvg from 'ui/shared/IconSvg';

const SwapButton = () => {
  return (
    <Button
      as="a"
      href="/swap"
      target="_self"
      variant="solid"
      size="xs"
      borderRadius="sm"
      height={ 5 }
      px={ 1.5 }
    >
      <IconSvg name="swap" boxSize={ 3 } mr={{ base: 0, sm: 1 }}/>
      <Box display={{ base: 'none', md: 'inline' }}>
        Get ONE
      </Box>
    </Button>
  );
};

export default React.memo(SwapButton);
