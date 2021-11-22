import dotenv from 'dotenv';

dotenv.config();

export const getEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw Error(`env.${name} is missing`);
  return value;
};

const read = () => {
  const address = getEnv('ADDRESS'); // '5GHYezbSCbiJcU1iCwN2YMnSMohDSZdudfZyEAYGneyx4xp3'
  const SURI = getEnv('SURI'); // //Charlie

  return { address, SURI };
};

export default read;
