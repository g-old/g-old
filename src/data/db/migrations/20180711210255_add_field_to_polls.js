exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('polls', table => {
      table.timestamp('deleted_at');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('polls', table => {
      table.dropColumn('deleted_at');
    }),
  ]);
};
