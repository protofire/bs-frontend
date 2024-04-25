import { Box, Flex } from '@chakra-ui/react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

import useShards from 'lib/hooks/useShards';
import ContentLoader from 'ui/shared/ContentLoader';
import PageTitle from 'ui/shared/Page/PageTitle';
import ShardSwitcher from 'ui/shared/shardSwitcher/ShardSwitcher';

const GraphQL = dynamic(() => import('ui/graphQL/GraphQL'), {
  loading: () => <ContentLoader/>,
  ssr: false,
});

const Page: NextPage = () => {
  const { shardId, shards } = useShards();

  return (
    <PageNextJs pathname="/graphiql">
      <Flex>
        <Box flex={ 1 }>
          <PageTitle title="GraphQL playground"/>
        </Box>
        <ShardSwitcher shardId={ shardId } shards={ shards }/>
      </Flex>
      <GraphQL/>
    </PageNextJs>
  );
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps';
