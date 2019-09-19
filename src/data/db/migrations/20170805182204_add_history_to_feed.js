exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('feeds', table => {
      table.json('history');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('feeds', table => {
      table.dropColumn('history');
    }),
  ]);
};
