/* eslint-disable react/jsx-no-bind */
import {
  Flex,
  Divider,
  useColorModeValue,
  Switch,
  Text,
} from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import { useAddressFormatContext } from 'lib/contexts/addressFormat';

import ColorModeSwitch from './ColorModeSwitch';
import SwapButton from './SwapButton';
import TopBarStats from './TopBarStats';

const AddressSwitcher = () => {
  const { setFormat, isEthFormat } = useAddressFormatContext();

  const handleSwitchChange = React.useCallback(() => {
    setFormat(isEthFormat ? 'one1' : 'eth');
  }, [ isEthFormat, setFormat ]);

  return (
    <>
      <Text fontSize="xs" mr={ 2 } color="text_secondary">
        ONE/ETH
      </Text>
      <Switch
        isChecked={ isEthFormat }
        onChange={ handleSwitchChange }
        colorScheme="teal"
        size={{ base: 'sm', sm: 'md' }}
      />
    </>
  );
};

const TopBar = () => {
  const bgColor = useColorModeValue('gray.50', 'whiteAlpha.100');
  const bgColorWarning = useColorModeValue('gray.100', 'whiteAlpha.300');

  const [ showBanner, setShowBanner ] = React.useState(false);

  React.useEffect(() => {
    const isBannerClosed = localStorage.getItem('isBannerClosed');
    if (isBannerClosed === 'true') {
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const handleClose = () => {
    setShowBanner(false);
    localStorage.setItem('isBannerClosed', 'true');
  };

  return (
    <>
      <Flex
        py={ 2 }
        px={ 6 }
        bgColor={ bgColor }
        justifyContent="space-between"
        alignItems="center"
      >
        <TopBarStats/>
        <Flex alignItems="center">
          <>
            <AddressSwitcher/>
            <Divider
              mr={ 3 }
              ml={{ base: 2, sm: 3 }}
              height={ 4 }
              orientation="vertical"
            />
          </>
          <>
            <SwapButton/>
            <Divider
              mr={ 3 }
              ml={{ base: 2, sm: 3 }}
              height={ 4 }
              orientation="vertical"
            />
          </>
          <ColorModeSwitch/>
        </Flex>
      </Flex>
      { config.chain.showBanner && showBanner && (
        <Flex
          py={ 2 }
          px={ 6 }
          bgColor={ bgColorWarning }
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="sm" mr={ 3 }>
            The chain is currently being indexed. Some data may be temporarily
            unavailable, and you may experience degraded performance.
          </Text>
          <Text
            fontSize="sm"
            cursor="pointer"
            decoration="underline"
            onClick={ handleClose }
          >
            Dismiss
          </Text>
        </Flex>
      ) }
    </>
  );
};

export default React.memo(TopBar);
