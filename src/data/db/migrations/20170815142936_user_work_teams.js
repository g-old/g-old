exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('user_work_teams').then(exists => {
      if (!exists) {
        return knex.schema.createTable('user_work_teams', table => {
          table.increments();
          table
            .integer('work_team_id')
            .unsigned()
            .notNullable();
          table.foreign('work_team_id').references('work_teams.id');
          table
            .integer('user_id')
            .unsigned()
            .notNullable();
          table.foreign('user_id').references('users.id');
          table.unique(['work_team_id', 'user_id']);
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('user_work_teams')]);
};
