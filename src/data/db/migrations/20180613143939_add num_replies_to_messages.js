exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('messages', table => {
      table.integer('num_replies').defaultsTo(0);
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('messages', table => {
      table.dropColumn('num_replies');
    }),
  ]);
};
