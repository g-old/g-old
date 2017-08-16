exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('feeds', (table) => {
      table.json('history');
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('feeds', (table) => {
      table.dropColumn('history');
    }),
  ]);
};
