export type StakingApi = {
  Undelegations: Array<StakingApiUndelegations> | null;
  amount: number | null;
  delegator_address: string | null;
  reward: number | null;
  validator_address: string | null;
};

export type StakingApiUndelegations = {
  Amount: number;
  Epoch: number;
};

export type StakingApiFailed = StakingApi & {
  fetchError: true;
};
