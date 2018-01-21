exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('proposals', table => {
      table.integer('work_team_id');
      table
        .foreign('work_team_id')
        .references('work_teams.id')
        .onDelete('CASCADE');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('proposals', table => {
      table.dropForeign('work_team_id');
      table.dropColumn('work_team_id');
    }),
  ]);
};
