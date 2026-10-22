import { Alert, AlertIcon, Link, Text } from '@chakra-ui/react';
import React from 'react';

const SUNSET_DATE = 'November 18, 2026';
const ANNOUNCEMENT_URL = 'https://x.com/harmonyprotocol/status/2112865144338620431';

const SunsetBanner = () => {
  return (
    <Alert
      status="warning"
      justifyContent="center"
      alignItems={{ base: 'flex-start', md: 'center' }}
      py={ 2 }
      px={ 6 }
      borderRadius={ 0 }
    >
      <AlertIcon mt={{ base: '3px', md: 0 }}/>
      <Text fontSize="sm">
        <b>Harmony is sunsetting its L1 chain.</b> This Explorer will be permanently shut down on <b>{ SUNSET_DATE }</b>.{ ' ' }
        <Link href={ ANNOUNCEMENT_URL } isExternal fontWeight={ 600 }>
          Read the official announcement
        </Link>
      </Text>
    </Alert>
  );
};

export default React.memo(SunsetBanner);
