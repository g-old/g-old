exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('notes', table => {
      table.boolean('is_published').defaultsTo(true);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('notes', table => {
      table.boolean('is_published');
    }),
  ]);
};
