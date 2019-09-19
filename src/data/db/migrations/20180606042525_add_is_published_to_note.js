exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('notes', table => {
      table.boolean('is_published').defaultsTo(true);
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('notes', table => {
      table.dropColumn('is_published');
    }),
  ]);
};
