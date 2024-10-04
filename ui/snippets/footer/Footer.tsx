import type { GridProps } from '@chakra-ui/react';
import { Box, Grid, Flex, VStack, Skeleton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import type { CustomLinksGroup } from 'types/footerLinks';

import config from 'configs/app';
import type { ResourceError } from 'lib/api/resources';
import useFetch from 'lib/hooks/useFetch';
import NetworkAddToWallet from 'ui/shared/NetworkAddToWallet';

import FooterLinkItem from './FooterLinkItem';
import IntTxsIndexingStatus from './IntTxsIndexingStatus';

const MAX_LINKS_COLUMNS = 4;

const Footer = () => {
  const BLOCKSCOUT_LINKS = [
    {
      icon: 'edit' as const,
      iconSize: '16px',
      text: 'Submit an issue',
      url: 'https://t.me/protofiresupport',
    },
    {
      icon: 'social/canny' as const,
      iconSize: '20px',
      text: 'Feature request',
      url: 'https://t.me/protofiresupport',
    },
    {
      icon: 'social/tweet' as const,
      iconSize: '18px',
      text: 'Twitter',
      url: 'https://twitter.com/harmonyprotocol',
    },
  ];

  const fetch = useFetch();

  const { isPlaceholderData, data: linksData } = useQuery<
  unknown,
  ResourceError<unknown>,
  Array<CustomLinksGroup>
  >({
    queryKey: [ 'footer-links' ],
    queryFn: async() =>
      fetch(config.UI.footer.links || '', undefined, {
        resource: 'footer-links',
      }),
    enabled: Boolean(config.UI.footer.links),
    staleTime: Infinity,
    placeholderData: [],
  });

  const colNum = isPlaceholderData ?
    1 :
    Math.min(linksData?.length || Infinity, MAX_LINKS_COLUMNS) + 1;

  const renderNetworkInfo = React.useCallback(
    (gridArea?: GridProps['gridArea']) => {
      return (
        <Flex
          gridArea={ gridArea }
          flexWrap="wrap"
          columnGap={ 8 }
          rowGap={ 6 }
          mb={{ base: 5, lg: 0 }}
          _empty={{ display: 'none' }}
        >
          { !config.UI.indexingAlert.intTxs.isHidden && <IntTxsIndexingStatus/> }
          <NetworkAddToWallet/>
        </Flex>
      );
    },
    [],
  );

  const containerProps: GridProps = {
    as: 'footer',
    px: { base: 4, lg: 12 },
    py: { base: 4, lg: 9 },
    borderTop: '1px solid',
    borderColor: 'divider',
    columnGap: { lg: '32px', xl: '100px' },
  };

  if (config.UI.footer.links) {
    return (
      <Grid { ...containerProps }>
        <div>{ renderNetworkInfo() }</div>

        <Grid
          gap={{
            base: 6,
            lg: colNum === MAX_LINKS_COLUMNS + 1 ? 2 : 8,
            xl: 12,
          }}
          gridTemplateColumns={{
            base: 'repeat(auto-fill, 160px)',
          }}
          justifyContent={{ lg: 'flex-end' }}
          mt={{ base: 8, lg: 0 }}
        >
          { [
            { title: 'Blockscout', links: BLOCKSCOUT_LINKS },
            ...(linksData || []),
          ]
            .slice(0, colNum)
            .map((linkGroup) => (
              <Box key={ linkGroup.title }>
                <Skeleton
                  fontWeight={ 500 }
                  mb={ 3 }
                  display="inline-block"
                  isLoaded={ !isPlaceholderData }
                >
                  { linkGroup.title }
                </Skeleton>
                <VStack spacing={ 1 } alignItems="start">
                  { linkGroup.links.map((link) => (
                    <FooterLinkItem
                      { ...link }
                      key={ link.text }
                      isLoading={ isPlaceholderData }
                    />
                  )) }
                </VStack>
              </Box>
            )) }
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid
      { ...containerProps }
      gridTemplateAreas={{
        lg: `
          "network links-top"
        `,
      }}
    >
      { renderNetworkInfo({ lg: 'network' }) }

      <Grid
        gridArea={{ lg: 'links-top' }}
        gap={ 1 }
        gridTemplateColumns={{
          base: 'repeat(auto-fill, 160px)',
        }}
        gridTemplateRows={{
          base: 'auto',
        }}
        gridAutoFlow={{ base: 'row', lg: 'column' }}
        alignContent="start"
        justifyContent={{ lg: 'flex-end' }}
        justifySelf={{ lg: 'end' }}
        mt={{ base: 2, lg: 0 }}
      >
        { BLOCKSCOUT_LINKS.map((link) => (
          <FooterLinkItem { ...link } key={ link.text }/>
        )) }
      </Grid>
    </Grid>
  );
};

export default React.memo(Footer);
