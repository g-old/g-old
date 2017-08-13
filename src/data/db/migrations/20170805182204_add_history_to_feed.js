exports.up = function (knex) {
  return knex.schema.table('feeds', (table) => {
    table.json('history');
  });
};

exports.down = function (knex) {
  return knex.schema.table('feeds', (table) => {
    table.dropColumn('history');
  });
};
