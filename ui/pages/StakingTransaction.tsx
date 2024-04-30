import { useRouter } from 'next/router';
import React from 'react';

import type { RoutedTab } from 'ui/shared/Tabs/types';

import useApiQuery from 'lib/api/useApiQuery';
import throwOnResourceLoadError from 'lib/errors/throwOnResourceLoadError';
import getQueryParamString from 'lib/router/getQueryParamString';
import PageTitle from 'ui/shared/Page/PageTitle';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';
import TabsSkeleton from 'ui/shared/Tabs/TabsSkeleton';
import useTabIndexFromQuery from 'ui/shared/Tabs/useTabIndexFromQuery';
import StakingTxDetails from 'ui/stakingTx/StakingTxDetails';
import StakingTxDetailsDegraded from 'ui/stakingTx/StakingTxDetailsDegraded';
import StakingTxLogs from 'ui/stakingTx/StakingTxLogs';

const StakingTransactionPageContent = () => {
  const router = useRouter();

  const hash = getQueryParamString(router.query.hash);

  const queryResult = useApiQuery<'staking_tx'>('staking_tx', {
    pathParams: { hash },
  });
  const { isError, isPlaceholderData, error } = queryResult;

  const showDegradedView = isError || isPlaceholderData;

  const tabs: Array<RoutedTab> = (() => {
    const detailsComponent = showDegradedView ?
      <StakingTxDetailsDegraded hash={ hash } query={ queryResult }/> :
      <StakingTxDetails query={ queryResult }/>;

    return [
      {
        id: 'index',
        title: 'Details',
        component: detailsComponent,
      },
      { id: 'logs', title: 'Logs', component: <StakingTxLogs txQuery={ queryResult }/> },
    ].filter(Boolean);
  })();

  const tabIndex = useTabIndexFromQuery(tabs);

  const content = (() => {
    // if (isPlaceholderData && !showDegradedView) {
    if (isPlaceholderData) {
      return (
        <>
          <TabsSkeleton tabs={ tabs } mt={ 6 }/>
          { tabs[tabIndex]?.component }
        </>
      );
    }

    return <RoutedTabs tabs={ tabs }/>;
  })();

  // if (isError && !showDegradedView) {
  if (isError) {
    if (error?.status === 422 || error?.status === 404) {
      throwOnResourceLoadError({ resource: 'staking_tx', error, isError: true });
    }
  }

  return (
    <>
      <PageTitle
        title="Staking transaction details"
      />
      { content }
    </>
  );
};

export default StakingTransactionPageContent;
