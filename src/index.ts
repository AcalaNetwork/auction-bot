import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ActionRegistry } from '@open-web3/guardian';
import { CollateralAuction, Event } from '@open-web3/guardian/types';
import config from './config';
import { setupKeyring } from './setupKeyring';
import { setDefaultConfig, logger } from './utils';
import { onAuction } from './onAuction';
import { onAuctionDealt } from './onAuctionDealt';

export type Metadata = {
  network: string;
  nodeEndpoint: string | string[];
  action: { margin: number };
};

const main = async () => {
  const { address, SURI } = config();
  const { signer } = await setupKeyring(SURI, address);

  const auction$ = new Subject<[CollateralAuction, Metadata]>();
  const auctionDealt$ = new Subject<[Event, Metadata]>();

  auction$
    .pipe(
      concatMap(
        async ([auction, metadata]) =>
          await onAuction(address, signer, auction, metadata).catch((e) =>
            logger.error(e)
          )
      )
    )
    .subscribe();

  auctionDealt$
    .pipe(
      concatMap(
        async ([event, metadata]) =>
          await onAuctionDealt(signer, event, metadata).catch((e) =>
            logger.error(e)
          )
      )
    )
    .subscribe();

  // register `collateral_auction_created` action to feed `auction$` with data
  ActionRegistry.register(
    'collateral_auction_created',
    (data: CollateralAuction, metadata: Metadata) => {
      auction$.next([data, metadata]);
    }
  );

  // register `collateral_auction_dealt` action to feed `auctionDealt$` with data
  ActionRegistry.register(
    'collateral_auction_dealt',
    (data: Event, metadata: Metadata) => {
      auctionDealt$.next([data, metadata]);
    }
  );

  // set Guardian CLI default config. Use `--config your_config.yml` to override
  setDefaultConfig('config.yml');

  // start guardian
  require('@open-web3/guardian-cli');
};

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
