exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('work_teams', table => {
      table
        .integer('num_members')
        .unsigned()
        .defaultsTo(0);
      table
        .integer('num_discussions')
        .unsigned()
        .defaultsTo(0);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('work_teams', table => {
      table.dropColumn('num_members');
      table.dropColumn('num_discussions');
    }),
  ]);
};
