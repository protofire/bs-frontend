import React from 'react';

import type { Transaction } from 'types/api/transaction';

export default function useTxMethod(tx?: Transaction): string | null {
  const method = React.useMemo(() => {
    if (!tx) {
      return null;
    }
    if (tx.method) {
      return tx.method;
    }
    if (tx.raw_input.startsWith('0xbda8c0e9')) {
      return 'Undelegate';
    }
    if (tx.raw_input.startsWith('0x510b11bb')) {
      return 'Delegate';
    }
    if (tx.raw_input.startsWith('0x6d6b2f77')) {
      return 'CollectRewards';
    }
    return null;
  }, [ tx ]);

  return method;
}
