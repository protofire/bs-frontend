import React, { useEffect, useState } from 'react';

import useFetch from '../hooks/useFetch';
import isBrowser from '../isBrowser';

const TOKEN_PRICE_LS_KEY = 'token_price_cache';
const BinanceRatesUrl = 'https://api.binance.com/api/v3/klines?symbol=ONEUSDT&interval=1d&limit=1000';
const DayMs = 24 * 60 * 60 * 1000;

interface TokenPrice {
  price: number;
  timestamp: number;
}

interface ProviderProps {
  children: React.ReactNode;
}

type TimestampValue = number | string | null
type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

interface ITokenPriceContext {
  getPriceByTimestamp: (timestamp: TimestampValue) => number | null;
}

const getValuesFromLS = () => {
  try {
    const data = localStorage.getItem(TOKEN_PRICE_LS_KEY);
    if (data) {
      return JSON.parse(data) as Array<TokenPrice>;
    }
  } catch (e) {}
  return [];
};

const saveValuesToLs = (values: Array<TokenPrice>) => {
  localStorage.setItem(TOKEN_PRICE_LS_KEY, JSON.stringify(values));
};

export const TokenPriceContext = React.createContext<ITokenPriceContext>({
  getPriceByTimestamp: () => {
    return null;
  },
});

export function TokenPriceProvider({ children }: ProviderProps) {
  const [ values, setValues ] = useState<Array<TokenPrice>>([]);
  const fetch = useFetch();

  const browser = isBrowser();

  useEffect(() => {
    const updateCache = async() => {
      try {
        const valuesFromLS = getValuesFromLS();
        const lastValueFromLS = valuesFromLS[valuesFromLS.length - 1];
        // Fetch token prices history from Binance
        if (
          !lastValueFromLS ||
          (Date.now() - lastValueFromLS.timestamp > DayMs)
        ) {
          const result = await fetch<Array<BinanceKline>, unknown>(BinanceRatesUrl);
          if (Array.isArray(result)) {
            const newValues: Array<TokenPrice> = result.map(([ timestamp, price ]) => {
              return {
                timestamp,
                price: Number(price),
              };
            });
            setValues(newValues);
            saveValuesToLs(newValues);
          }
        } else {
          // Restore values from LS
          setValues(valuesFromLS);
        }
      } catch (e) {
        setValues([]);
      }
    };

    if (browser) {
      updateCache();
    }
  }, [ browser, fetch ]);

  const getPriceByTimestamp = (timestamp: TimestampValue) => {
    if (timestamp) {
      const unixTimestamp = new Date(timestamp).valueOf();
      const item = values.find(item => Math.abs(unixTimestamp - item.timestamp) <= 2 * DayMs);
      if (item) {
        return item.price;
      }
    }
    return null;
  };

  return (
    <TokenPriceContext.Provider
      value={{
        getPriceByTimestamp,
      }}
    >
      { children }
    </TokenPriceContext.Provider>
  );
}

export function useTokenPrice() {
  const context = React.useContext(TokenPriceContext);
  if (context === undefined) {
    return {
      getPriceByTimestamp: () => {
        return null;
      },
    };
  }
  return context;
}
