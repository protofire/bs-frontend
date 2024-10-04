import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

const Swap = dynamic(() => import('ui/pages/Swap'), { ssr: false });

const Page: NextPage = () => {
  return (
    <PageNextJs pathname="/tokens">
      <Swap/>
    </PageNextJs>
  );
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps';
