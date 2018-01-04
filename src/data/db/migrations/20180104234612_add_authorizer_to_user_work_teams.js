exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user_work_teams', table => {
      table.dropForeign('work_team_id');
      table
        .foreign('work_team_id')
        .references('work_teams.id')
        .onDelete('CASCADE');

      table.integer('authorizer_id').unsigned();
      table.foreign('authorizer_id').references('users.id');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user_work_teams', table => {
      table.dropForeign('authorizer_id');
      table.dropColumn('authorizer_id');
    }),
  ]);
};
