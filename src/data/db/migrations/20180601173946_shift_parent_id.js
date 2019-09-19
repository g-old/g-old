exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('messages', table => {
      table.integer('parent_id');
      table.foreign('parent_id').references('messages.id');
    }),
    knex.schema.table('communications', table => {
      table.dropColumn('parent_id');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('communications', table => {
      table.integer('parent_id');
    }),
    knex.schema.table('messages', table => {
      table.dropColumn('parent_id');
    }),
  ]);
};
