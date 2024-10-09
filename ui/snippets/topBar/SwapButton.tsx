import { Button, Box } from '@chakra-ui/react';
import React from 'react';

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
      bgColor="var(--chakra-colors-blue-300)"
      _hover={{ bgColor: 'var(--chakra-colors-blue-300)' }}
    >
      <Box display={{ base: 'none', md: 'inline' }}>
        Get ONE
      </Box>
    </Button>
  );
};

export default React.memo(SwapButton);
