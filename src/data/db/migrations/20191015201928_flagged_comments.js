exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('flagged_comments').then(exists => {
      if (!exists) {
        return knex.schema.createTable('flagged_comments', table => {
          table.increments();
          table
            .integer('flagger_id')
            .unsigned()
            .notNullable();
          table.foreign('flagger_id').references('users.id');
          table.integer('solver_id').unsigned();
          table.foreign('solver_id').references('users.id');
          table
            .integer('workteam_id')
            .unsigned()
            .notNullable();
          table
            .foreign('workteam_id')
            .references('work_teams.id')
            .onDelete('CASCADE');
          table
            .integer('comment_id')
            .unsigned()
            .notNullable()
            .unique();
          table.foreign('comment_id').references('comments.id');
          table.integer('num_flags').defaultsTo(1);
          table.text('content').notNullable();
          table
            .enu('state', ['open', 'deleted', 'rejected'])
            .notNullable()
            .defaultsTo('open');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('flagged_comments')]);
};
