/* eslint comma-dangle: ["error", {"functions": "never"}]*/

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('roles').del()
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
