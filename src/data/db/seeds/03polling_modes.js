/* eslint comma-dangle: ["error", {"functions": "never"}]*/

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex
  .raw('ALTER TABLE polling_modes DISABLE TRIGGER ALL;')
  .then(() => knex('polling_modes').del())
  .then(() => knex.raw('ALTER TABLE polling_modes ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(() =>
       Promise.all([
        // Inserts seed entries
         knex('polling_modes').insert({ name: 'propose', unipolar: true, with_statements: false, threshold_ref: 'all' }),
         knex('polling_modes').insert({ name: 'vote', unipolar: false, with_statements: true, threshold_ref: 'voters' })
       ])
    );
};
