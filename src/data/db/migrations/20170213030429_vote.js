exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('votes').then(exists => {
      if (!exists) {
        return knex.schema.createTable('votes', table => {
          table.increments();
          table
            .integer('user_id')
            .unsigned()
            .notNullable();
          table.foreign('user_id').references('users.id');
          table.enu('position', ['pro', 'con']).notNullable();
          table
            .integer('poll_id')
            .unsigned()
            .notNullable();
          table.foreign('poll_id').references('polls.id');
          table.unique(['poll_id', 'user_id']);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('votes')]);
};
