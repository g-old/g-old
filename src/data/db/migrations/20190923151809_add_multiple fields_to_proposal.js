exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('proposals', table => {
      table.text('summary');
      table.string('image');
      table.boolean('is_verified').defaultsTo(false);
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('proposals', table => {
      table.dropColumn('deleted_at');
      table.dropColumn('image');
      table.dropColumn('is_verified');
    }),
  ]);
};
