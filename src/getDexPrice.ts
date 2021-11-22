import { ApiManager } from '@open-web3/api';
import { FixedPointNumber, Token } from '@acala-network/sdk-core';
import { Balance } from '@open-web3/orml-types/interfaces';

export const getDexPrice = async (
  apiManager: ApiManager,
  tokenPrecision: (token: string) => number,
  currencyId: any
) => {
  const stableCoin = apiManager.api.consts.cdpEngine.getStableCurrencyId;

  // calculate dex price
  const baseCurrency = apiManager.api.createType('CurrencyId', stableCoin);
  const otherCurrency = apiManager.api.createType('CurrencyId', {
    token: currencyId
  });

  const [baseToken, otherToken] = Token.sortCurrencies(
    baseCurrency,
    otherCurrency
  );

  const [base, other] = await apiManager.api.query.dex.liquidityPool<
    [Balance, Balance]
  >([baseToken, otherToken]);

  const _base = FixedPointNumber.fromInner(
    base.toString(),
    tokenPrecision(baseToken.asToken.toString())
  );
  const _other = FixedPointNumber.fromInner(
    other.toString(),
    tokenPrecision(otherToken.asToken.toString())
  );

  if (_other.isZero()) throw Error('Other liquidity is zero');
  const price = _base.div(_other);
  price.setPrecision(18);

  return price._getInner().toFixed(0);
};
