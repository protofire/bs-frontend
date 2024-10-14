import React, { useEffect } from 'react';

import { toBech32, fromBech32 } from 'lib/formatting/formatAddress';

import isBrowser from '../isBrowser';

const ADDRESS_FORMAT_LS_KEY = 'address_format';

interface AddressFormatProviderProps {
  children: React.ReactNode;
}

type TAddressFormat = 'one1' | 'eth';

interface TAddressFormatContext {
  setFormat: (format: TAddressFormat) => void;
  formatAddress: (address: string) => string;
  isEthFormat: boolean;
  toOne: (address: string) => string;
}

export const AddressFormatContext = React.createContext<TAddressFormatContext>({
  setFormat: () => {},
  formatAddress: (address: string) => address,
  toOne: (address: string) => address,
  isEthFormat: true,
});

const getInitialAddressFormat = (): TAddressFormat => {
  const lsValue = window.localStorage.getItem(ADDRESS_FORMAT_LS_KEY) || '';
  if ([ 'one1', 'eth' ].includes(lsValue)) {
    return lsValue as TAddressFormat;
  }
  return 'one1';
};

const saveAddressFormatInLS = (
  format: TAddressFormat,
) => {
  window.localStorage.setItem(ADDRESS_FORMAT_LS_KEY, format);
};

export function AddressFormatProvider({
  children,
}: AddressFormatProviderProps) {
  const [ format, _setFormat ] = React.useState<TAddressFormat>('one1');

  const browser = isBrowser();
  const isEthFormat = React.useMemo(() => format === 'eth', [ format ]);

  useEffect(() => {
    if (browser) {
      _setFormat(getInitialAddressFormat());
    }
  }, [ browser ]);

  const formatAddress = React.useCallback(
    (address: string) => {
      if (format === 'one1' && address.startsWith('0x')) {
        return toBech32(address);
      }
      if (format === 'eth' && address.startsWith('one1')) {
        return fromBech32(address);
      }
      return address;
    },
    [ format ],
  );

  const toOne = React.useCallback(
    (address: string) => {
      if (address.startsWith('0x')) {
        return toBech32(address);
      }
      return address;
    },
    [ ],
  );

  const setFormat = React.useCallback((format: TAddressFormat) => {
    _setFormat(format);
    saveAddressFormatInLS(format);
  }, []);

  return (
    <AddressFormatContext.Provider
      value={{
        setFormat,
        formatAddress,
        isEthFormat,
        toOne,
      }}
    >
      { children }
    </AddressFormatContext.Provider>
  );
}

export function useAddressFormatContext() {
  const context = React.useContext(AddressFormatContext);
  if (context === undefined) {
    return {
      setFormat: () => {},
      formatAddress: (address: string) => address,
      toOne: (address: string) => address,
      isEthFormat: true,
    };
  }
  return context;
}
