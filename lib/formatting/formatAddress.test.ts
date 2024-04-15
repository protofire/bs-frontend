import { toBech32, fromBech32 } from './formatAddress';

const address1 = '0x8c00f52aa06f522b443dda18e1ba55005b2a1014';
const address2 = 'one13sq0224qdafzk3pamgvwrwj4qpdj5yq5xxq55w';

describe('formatAddress', () => {
  test('formats address without "0x" prefix', () => {
    const formattedAddress = toBech32(address1);
    expect(formattedAddress).toBe(address2);
  });

  test('formats address with "one1" prefix', () => {
    const formattedAddress = fromBech32(address2);
    expect(formattedAddress).toBe(address1);
  });
});
