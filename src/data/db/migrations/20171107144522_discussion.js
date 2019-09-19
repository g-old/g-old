exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('discussions').then(exists => {
      if (!exists) {
        return knex.schema.createTable('discussions', table => {
          table.increments();
          table.text('content').notNullable();
          table.string('title').notNullable();
          table
            .integer('work_team_id')
            .unsigned()
            .notNullable();
          table.foreign('work_team_id').references('work_teams.id');
          table
            .integer('author_id')
            .unsigned()
            .notNullable();
          table.foreign('author_id').references('users.id');
          table
            .integer('num_comments')
            .unsigned()
            .defaultsTo(0);
          table.timestamp('closed_at').defaultsTo(null);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('discussions')]);
};
