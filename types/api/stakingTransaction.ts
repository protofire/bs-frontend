import type { AddressParam } from './addressParams';

export type StakingTransaction = {
  hash: string;
  nonce: number;
  block: number | null;
  timestamp: number;
  from: AddressParam;
  gas_price: string | null;
  gas: string | null;
  type: string | null;
  transaction_index: number;
  msg_validator_address: string;
  msg_name: string;
  msg_commission_rate: string;
  msg_max_commission_rate: string;
  msg_max_change_rate: string;
  msg_min_self_delegation: string;
  msg_max_total_delegation: string;
  msg_amount: string;
  msg_website: string;
  msg_identity: string;
  msg_security_contact: string;
  msg_details: string;
  msg_slot_pub_keys: Array<string>;
  msg_delegator_address: string;
  msg_slot_pub_key_to_add: string;
  msg_slot_pub_key_to_remove: string;
}
