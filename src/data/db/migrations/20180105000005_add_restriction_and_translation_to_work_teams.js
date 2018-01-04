exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('work_teams', table => {
      table
        .bool('restricted')
        .notNullable()
        .defaultsTo(true);
      table.string('de_name');
      table.string('it_name');
      table.string('lld_name');
      table.bool('main').defaultsTo(false);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('work_teams', table => {
      table.dropColumn('restricted');
      table.dropColumn('de_name');
      table.dropColumn('it_name');
      table.dropColumn('lld_name');
      table.dropColumn('main');
    }),
  ]);
};
