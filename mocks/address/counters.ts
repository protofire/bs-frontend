import type { AddressCounters } from 'types/api/address';

export const forContract: AddressCounters = {
  gas_usage_count: '319340525',
  token_transfers_count: '0',
  transactions_count: '5462',
  staking_transactions_count: '0',
  validations_count: '0',
};

export const forToken: AddressCounters = {
  gas_usage_count: '247479698',
  token_transfers_count: '1',
  transactions_count: '8474',
  staking_transactions_count: '0',
  validations_count: '0',
};

export const forValidator: AddressCounters = {
  gas_usage_count: '91675762951',
  token_transfers_count: '0',
  transactions_count: '820802',
  staking_transactions_count: '0',
  validations_count: '1726416',
};
