exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('statements').then(exists => {
      if (!exists) {
        return knex.schema.createTable('statements', table => {
          table.increments();
          table
            .integer('author_id')
            .unsigned()
            .notNullable();
          table.foreign('author_id').references('users.id');
          table.text('body').notNullable();
          table.enu('position', ['pro', 'con']).notNullable();
          table.integer('likes').defaultsTo(0);
          table
            .integer('vote_id')
            .unsigned()
            .notNullable();
          table
            .foreign('vote_id')
            .references('votes.id')
            .onDelete('CASCADE');
          table
            .integer('poll_id')
            .unsigned()
            .notNullable();
          table.foreign('poll_id').references('polls.id');
          table.unique(['poll_id', 'author_id']);
          table.timestamp('deleted_at');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('statements')]);
};
