import type { ChakraProps } from '@chakra-ui/react';
import { GrowthBookProvider } from '@growthbook/growthbook-react';
import * as Sentry from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';

import type { NextPageWithLayout } from 'nextjs/types';

import config from 'configs/app';
import useQueryClientConfig from 'lib/api/useQueryClientConfig';
import { AddressFormatProvider } from 'lib/contexts/addressFormat';
import { AppContextProvider } from 'lib/contexts/app';
import { ChakraProvider } from 'lib/contexts/chakra';
import { ScrollDirectionProvider } from 'lib/contexts/scrollDirection';
import { growthBook } from 'lib/growthbook/init';
import useLoadFeatures from 'lib/growthbook/useLoadFeatures';
import useNotifyOnNavigation from 'lib/hooks/useNotifyOnNavigation';
import useShards from 'lib/hooks/useShards';
import { SocketProvider } from 'lib/socket/context';
import theme from 'theme';
import AppErrorBoundary from 'ui/shared/AppError/AppErrorBoundary';
import GoogleAnalytics from 'ui/shared/GoogleAnalytics';
import Layout from 'ui/shared/layout/Layout';
import Web3ModalProvider from 'ui/shared/Web3ModalProvider';

import 'lib/setLocale';
// import 'focus-visible/dist/focus-visible';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
}

const ERROR_SCREEN_STYLES: ChakraProps = {
  h: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  width: 'fit-content',
  maxW: '800px',
  margin: '0 auto',
  p: { base: 4, lg: 0 },
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {

  useLoadFeatures();
  useNotifyOnNavigation();

  const [ wsUrl, setWsUrl ] = React.useState<string>('');
  const queryClient = useQueryClientConfig();
  const { shards } = useShards();
  const router = useRouter();

  const handleError = React.useCallback((error: Error) => {
    Sentry.captureException(error);
  }, []);

  const getLayout = Component.getLayout ?? ((page) => <Layout>{ page }</Layout>);

  React.useEffect(() => {
    const hashRoute = window.location.hash;
    if (hashRoute && hashRoute.startsWith('#')) {
      const routeWithoutHash = hashRoute.substring(1);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      router.push(routeWithoutHash);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const handleRouteChange = (urlString: string) => {
      const query = urlString.split('?')[1];
      const params = new URLSearchParams(query);
      const shard = params.get('shard') || '0';
      const url = new URL(`${ config.api.socket }${ config.api.basePath }/socket/v2`);
      const shardHost = shards[shard]?.apiHost;
      if (shardHost) {
        // Replace host
        url.host = shardHost;
      }
      setWsUrl(url.toString());
    };
    handleRouteChange(window.location.href);
    router.events.on('routeChangeStart', handleRouteChange);

    // Clean up the event listener
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChakraProvider theme={ theme } cookies={ pageProps.cookies }>
      <AppErrorBoundary
        { ...ERROR_SCREEN_STYLES }
        onError={ handleError }
      >
        <Web3ModalProvider>
          <AppContextProvider pageProps={ pageProps }>
            <AddressFormatProvider>
              <QueryClientProvider client={ queryClient }>
                <GrowthBookProvider growthbook={ growthBook }>
                  <ScrollDirectionProvider>
                    <SocketProvider url={ wsUrl }>
                      { getLayout(<Component { ...pageProps }/>) }
                    </SocketProvider>
                  </ScrollDirectionProvider>
                </GrowthBookProvider>
                <ReactQueryDevtools buttonPosition="bottom-left" position="left"/>
                <GoogleAnalytics/>
              </QueryClientProvider>
            </AddressFormatProvider>
          </AppContextProvider>
        </Web3ModalProvider>
      </AppErrorBoundary>
    </ChakraProvider>
  );
}

export default MyApp;
