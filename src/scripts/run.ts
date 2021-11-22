#!/usr/bin/env node

import run from '..';

run().catch((error) => {
  console.error(error);
  process.exit(-1);
});
