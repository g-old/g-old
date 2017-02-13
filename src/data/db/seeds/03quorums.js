/* eslint comma-dangle: ["error", {"functions": "never"}]*/

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('quorums').del()
    .then(() =>
       Promise.all([
        // Inserts seed entries
         knex('quorums').insert({ name: 'ask_vote', percentage: 20, voters: 'all' })
       ])
    );
};
