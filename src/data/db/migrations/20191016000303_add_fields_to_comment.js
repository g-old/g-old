exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('comments', table => {
      table.timestamp('deleted_at');
      table.integer('num_votes').defaultsTo(0);
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('comments', table => {
      table.dropColumn('deleted_at');
      table.dropColumn('num_votes');
    }),
  ]);
};
