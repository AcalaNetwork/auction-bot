import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

export const setupKeyring = async (SURI: string, address: string) => {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: 'sr25519' });
  keyring.addFromUri(SURI);

  const signer = keyring.getPair(address);
  return { keyring, signer };
};
