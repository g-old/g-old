exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('comments', table => {
      table.timestamp('deleted_at');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('comments', table => {
      table.dropColumn('deleted_at');
    }),
  ]);
};
