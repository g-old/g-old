exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('proposals', table => {
      table.timestamp('notified_at');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('proposals', table => {
      table.dropColumn('notified_at');
    }),
  ]);
};
