exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tags', table => {
      table.string('de_name');
      table.string('it_name');
      table.string('lld_name');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tags', table => {
      table.dropColumn('de_name');
      table.dropColumn('it_name');
      table.dropColumn('lld_name');
    }),
  ]);
};
