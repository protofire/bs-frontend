import type { ArrayElement } from 'types/utils';

export const TX_FIELDS_IDS = [
  'value',
  'fee_currency',
  'gas_price',
  'tx_fee',
  'gas_fees',
  'burnt_fees',
] as const;

export type TxFieldsId = ArrayElement<typeof TX_FIELDS_IDS>;

export const TX_ADDITIONAL_FIELDS_IDS = [
  'fee_per_gas',
] as const;

export type TxAdditionalFieldsId = ArrayElement<typeof TX_ADDITIONAL_FIELDS_IDS>;

export const TX_VIEWS_IDS = [
  'blob_txs',
] as const;

export type TxViewId = ArrayElement<typeof TX_VIEWS_IDS>;
