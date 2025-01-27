import { getEnvValue } from './utils';

const apiEndpoint = getEnvValue('NEXT_PUBLIC_STAKING_API_HOST');
const apiNetwork = getEnvValue('NEXT_PUBLIC_STAKING_API_NETWORK');

const stakingApi = Object.freeze({
  endpoint: apiEndpoint,
  host: `${ apiEndpoint }/networks/${ apiNetwork }/delegations`,
  network: apiNetwork,
});

export default stakingApi;
