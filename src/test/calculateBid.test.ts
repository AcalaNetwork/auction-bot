import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { calculateBid } from '../calculateBid';

use(chaiAsPromised);

describe('calculateBid', () => {
  const price1 = '10000000000000000000000';
  const price2 = '9880300654870267000000';
  it('should calculate bid', async () => {
    const bid1 = await calculateBid(
      { initialAmount: 1e8 } as any,
      price1,
      0.1,
      12,
      8
    );
    expect(bid1).to.be.eq('9000000000000000');

    const bid2 = await calculateBid(
      { initialAmount: 0.1e8 } as any,
      price1,
      0.2,
      12,
      8
    );
    expect(bid2).to.be.eq('800000000000000');

    const bid3 = await calculateBid(
      { initialAmount: 0.1e8 } as any,
      price2,
      0.1,
      12,
      8
    );
    expect(bid3).to.be.eq('889227058938324');
  });

  it('should throw because of last bid is greater', async () => {
    const bid = calculateBid(
      { initialAmount: 1e8, lastBid: 9_000e12 } as any,
      price1,
      0.1,
      12,
      8
    );
    expect(bid).to.be.eventually.rejectedWith(
      'Last bid is greater or equal to our bid'
    );
  });
});
