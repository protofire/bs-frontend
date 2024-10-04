import { Box } from '@chakra-ui/react';
import React from 'react';

const SwapPage = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <iframe
        id="simpleswap-frame"
        name="SimpleSwap Widget"
        width="528px"
        height="392px"
        src="https://simpleswap.io/widget/62d3bc7d-58e0-4815-87da-36fa3bd878ac"
        style={{
          borderRadius: '32px',
        }}
      ></iframe>
    </Box>
  );
};

export default SwapPage;
