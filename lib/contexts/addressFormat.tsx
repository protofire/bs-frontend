import React from 'react';

import { toBech32, fromBech32 } from 'lib/formatting/formatAddress';

interface AddressFormatProviderProps {
  children: React.ReactNode;
}

type TAddressFormat = 'one1' | 'eth';

interface TAddressFormatContext {
  setFormat: (format: TAddressFormat) => void;
  formatAddress: (address: string) => string;
  isEthFormat: boolean;
}

export const AddressFormatContext = React.createContext<TAddressFormatContext>({
  setFormat: () => {},
  formatAddress: (address: string) => address,
  isEthFormat: true,
});

export function AddressFormatProvider({
  children,
}: AddressFormatProviderProps) {
  const [ format, _setFormat ] = React.useState<TAddressFormat>('eth');

  const isEthFormat = React.useMemo(() => format === 'eth', [ format ]);

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

  const setFormat = React.useCallback((format: TAddressFormat) => {
    _setFormat(format);
  }, []);

  return (
    <AddressFormatContext.Provider
      value={{
        setFormat,
        formatAddress,
        isEthFormat,
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
      isEthFormat: true,
    };
  }
  return context;
}