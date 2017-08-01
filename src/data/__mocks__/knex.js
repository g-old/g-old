/* eslint-env jest */

const trx = {
  whereIn: () => ({
    count: () => ({ into: () => [{ count: 22 }] }),
  }),
  insert: data => ({ into: () => [data.id || '1'] }),
  where: () => ({ update: () => ({ into: () => ({ id: 1 }) }) }),
};
const test = () => ({
  transaction: a => Promise.resolve(a(trx)),
});
module.exports = test;
