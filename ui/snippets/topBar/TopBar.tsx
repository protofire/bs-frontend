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

const feature = config.features.swapButton;

const AddressSwitcher = () => {
  const { setFormat, isEthFormat } = useAddressFormatContext();

  const handleSwitchChange = React.useCallback(() => {
    setFormat(isEthFormat ? 'one1' : 'eth');
  }, [ isEthFormat, setFormat ]);

  return (
    <>
      <Text fontSize="sm" mr={ 2 }>
        ONE / ETH address
      </Text>
      <Switch
        isChecked={ isEthFormat }
        onChange={ handleSwitchChange }
        colorScheme="teal"
        size="md"
        mr={ 3 }
      />
    </>
  );
};

const TopBar = () => {
  const bgColor = useColorModeValue('gray.50', 'whiteAlpha.100');

  return (
    <Flex
      py={ 2 }
      px={ 6 }
      bgColor={ bgColor }
      justifyContent="space-between"
      alignItems="center"
    >
      <TopBarStats/>
      <Flex alignItems="center">
        <AddressSwitcher/>
        <Divider
          mr={ 3 }
          ml={{ base: 2, sm: 3 }}
          height={ 4 }
          orientation="vertical"
        />
        { feature.isEnabled && (
          <>
            <SwapButton/>
            <Divider
              mr={ 3 }
              ml={{ base: 2, sm: 3 }}
              height={ 4 }
              orientation="vertical"
            />
          </>
        ) }
        <ColorModeSwitch/>
      </Flex>
    </Flex>
  );
};

export default React.memo(TopBar);
