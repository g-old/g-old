exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('work_teams').then(exists => {
      if (!exists) {
        return knex.schema.createTable('work_teams', table => {
          table.increments();
          table.integer('coordinator_id').unsigned();
          table.foreign('coordinator_id').references('users.id');
          table
            .string('name')
            .notNullable()
            .unique();
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('work_teams')]);
};
