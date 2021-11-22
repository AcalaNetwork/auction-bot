import { WsProvider } from '@polkadot/rpc-provider';
import { ApiPromise } from '@polkadot/api';
import { options } from '@acala-network/api';
import { ApiManager } from '@open-web3/api';

export const setupTokenPrecision = async (api: ApiPromise) => {
  const decimals: Record<string, number> = {};

  const properties = await api.rpc.system.properties();
  const tokenSymbol = properties.tokenSymbol.unwrapOrDefault();
  const tokenDecimals = properties.tokenDecimals.unwrapOrDefault();
  if (tokenSymbol.length !== tokenDecimals.length) {
    throw Error(
      `Token symbols/decimals mismatch ${tokenSymbol} ${tokenDecimals}`
    );
  }
  tokenSymbol.forEach((symbol, index) => {
    decimals[symbol.toString()] = tokenDecimals[index].toNumber();
  });

  return (token: string): number => {
    const precision = decimals[token.toUpperCase()];
    if (!precision) throw Error(`Token "${token}" is not supported`);
    return precision;
  };
};

const setupAcalaApi = async (nodeEndpoint: string | string[]) => {
  const ws = new WsProvider(nodeEndpoint);
  const apiManager = await ApiManager.create(options({ provider: ws }));

  const tokenPrecision = await setupTokenPrecision(apiManager.api);

  return { apiManager, tokenPrecision };
};

let _promise: Promise<void>;
let _apiManager: ApiManager;
let _tokenPrecision: (token: string) => number;
export const setupApi = async (nodeEndpoint: string | string[]) => {
  if (!_promise) {
    _promise = new Promise((resolve) => {
      setupAcalaApi(nodeEndpoint).then(({ apiManager, tokenPrecision }) => {
        _apiManager = apiManager;
        _tokenPrecision = tokenPrecision;
        resolve();
      });
    });
  }
  await _promise;

  return { apiManager: _apiManager, tokenPrecision: _tokenPrecision };
};
