import '@acala-network/types';
import Big from 'big.js';
import { CollateralAuction } from '@open-web3/guardian/types';
import { KeyringPair } from '@polkadot/keyring/types';
import { OrmlAccountData } from '@open-web3/orml-types/interfaces';
import { setupApi } from './setupApi';
import { calculateBid } from './calculateBid';
import { getDexPrice } from './getDexPrice';
import { Metadata } from '.';

export const onAuction = async (
  address: string,
  signer: KeyringPair,
  auction: CollateralAuction,
  metadata: Metadata
) => {
  const {
    nodeEndpoint,
    action: { margin }
  } = metadata;

  const { apiManager, tokenPrecision } = await setupApi(nodeEndpoint);

  const stableCoin = apiManager.api.consts.cdpEngine.getStableCurrencyId;
  const balance = await apiManager.api.query.tokens.accounts<OrmlAccountData>(
    address,
    stableCoin
  );

  const stableCoinPrecision = tokenPrecision(stableCoin.asToken.toString());
  const collateralPrecision = tokenPrecision(auction.currencyId);

  const price = await getDexPrice(
    apiManager,
    tokenPrecision,
    auction.currencyId
  );

  const bid = await calculateBid(
    auction,
    price,
    margin,
    stableCoinPrecision,
    collateralPrecision
  );

  // simple check for enough balance
  if (Big(balance.free.toString()).lt(bid)) {
    throw Error('Not enough balance to place the bid');
  }

  const tx = apiManager.api.tx.auction.bid(auction.auctionId, bid);
  await apiManager.signAndSend(tx, { account: signer }).inBlock;
};
