import '@acala-network/types';

import { Event } from '@open-web3/guardian/types';
import { KeyringPair } from '@polkadot/keyring/types';
import { setupApi } from './setupApi';
import { Metadata } from '.';

export const onAuctionDealt = async (
  signer: KeyringPair,
  event: Event,
  metadata: Metadata
) => {
  const currencyId = event.args['collateral_type'];
  const amount = event.args['collateral_amount'];

  const { apiManager } = await setupApi(metadata.nodeEndpoint);

  const stableCoin = apiManager.api.consts.cdpEngine.getStableCurrencyId;
  const tx = apiManager.api.tx.dex.swapWithExactSupply(
    [currencyId, stableCoin],
    amount,
    0
  );
  await apiManager.signAndSend(tx, { account: signer }).inBlock;
};
