exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('work_teams', table => {
      table
        .integer('num_proposals')
        .unsigned()
        .defaultsTo(0);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('work_teams', table => {
      table.dropColumn('num_proposals');
    }),
  ]);
};
