import { Box, Flex } from '@chakra-ui/react';
import type { NextPage } from 'next';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

import useShards from 'lib/hooks/useShards';
import SwaggerUI from 'ui/apiDocs/SwaggerUI';
import PageTitle from 'ui/shared/Page/PageTitle';
import ShardSwitcher from 'ui/shared/shardSwitcher/ShardSwitcher';

const Page: NextPage = () => {
  const { shardId, shards } = useShards();

  return (
    <PageNextJs pathname="/api-docs">
      <Flex>
        <Box flex={ 1 }>
          <PageTitle title="API Documentation"/>
        </Box>
        <ShardSwitcher shardId={ shardId } shards={ shards }/>
      </Flex>
      <SwaggerUI/>
    </PageNextJs>
  );
};

export default Page;

export { apiDocs as getServerSideProps } from 'nextjs/getServerSideProps';
