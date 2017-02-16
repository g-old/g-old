/* eslint comma-dangle: ["error", {"functions": "never"}]*/

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries

  return knex
  .raw('ALTER TABLE quorums DISABLE TRIGGER ALL;')
  .then(() => knex.raw('ALTER SEQUENCE quorums_id_seq RESTART WITH 1;'))
  .then(() => knex('quorums').del())
  .then(() => knex.raw('ALTER TABLE quorums ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(() =>
  Promise.all([
    knex('quorums').insert({ name: 'ask_vote', percentage: 20, voters: 'all' })
  ])
    );
};
