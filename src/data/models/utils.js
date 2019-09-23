/* eslint-disable import/prefer-default-export */
/* @flow */

export const TargetType = {
  PROPOSAL: 'proposal',
  DISCUSSION: 'discussion',
  GROUP: 'group',
  USER: 'user',
  ALL: 'all',
  ROLE: 'role',
};

export const groupAndSumBy = function group(data, key, countKey) {
  return data.reduce((res, x) => {
    const entry = res[x[key]];
    if (entry) {
      entry.count += x[countKey];
      entry.elms.push(x);
    } else {
      res[x[key]] = { count: x[countKey], elms: [x] };
    }
    return res;
  }, {});
};

export const transactify = async (fn, dbConnector, trx) => {
  if (trx) {
    return fn(trx);
  }
  return dbConnector.transaction(async tContext => fn(tContext));
};
