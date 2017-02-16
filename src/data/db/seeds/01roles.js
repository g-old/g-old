/* eslint comma-dangle: ["error", {"functions": "never"}]*/

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex
  .raw('ALTER TABLE roles DISABLE TRIGGER ALL;')
  .then(() => knex('roles').del())
  .then(() => knex.raw('ALTER TABLE roles ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(() =>
       Promise.all([
        // Inserts seed entries
         knex('roles').insert({ id: 1, type: 'admin' }),
         knex('roles').insert({ id: 2, type: 'mod' }),
         knex('roles').insert({ id: 3, type: 'user' }),
         knex('roles').insert({ id: 4, type: 'guest' })
       ])
    );
};
