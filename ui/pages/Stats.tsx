import { Box, Flex } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import useShards from 'lib/hooks/useShards';
import PageTitle from 'ui/shared/Page/PageTitle';
import ShardSwitcher from 'ui/shared/shardSwitcher/ShardSwitcher';

import ChartsWidgetsList from '../stats/ChartsWidgetsList';
import NumberWidgetsList from '../stats/NumberWidgetsList';
import StatsFilters from '../stats/StatsFilters';
import useStats from '../stats/useStats';

const Stats = () => {
  const { shardId, shards } = useShards();
  const {
    isPlaceholderData,
    isError,
    sections,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    handleFilterChange,
    displayedCharts,
    filterQuery,
    refetch,
  } = useStats();

  const handleSwitchShard = React.useCallback(async() => {
    await refetch();
  }, [ refetch ]);

  return (
    <>
      <Flex>
        <Box flex={ 1 }><PageTitle title={ `${ config.chain.name } stats` }/></Box>
        <ShardSwitcher shardId={ shardId } shards={ shards } handleSwitchShard={ handleSwitchShard }/>
      </Flex>

      <Box key={ shardId }>
        <Box mb={{ base: 6, sm: 8 }}>
          <NumberWidgetsList/>
        </Box>

        <Box mb={{ base: 6, sm: 8 }}>
          <StatsFilters
            sections={ sections }
            currentSection={ currentSection }
            onSectionChange={ handleSectionChange }
            interval={ interval }
            onIntervalChange={ handleIntervalChange }
            onFilterInputChange={ handleFilterChange }
          />
        </Box>

        <ChartsWidgetsList
          filterQuery={ filterQuery }
          isError={ isError }
          isPlaceholderData={ isPlaceholderData }
          charts={ displayedCharts }
          interval={ interval }
        />
      </Box>
    </>
  );
};

export default Stats;
