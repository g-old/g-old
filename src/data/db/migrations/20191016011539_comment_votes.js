exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('comment_votes').then(exists => {
      if (!exists) {
        return knex.schema.createTable('comment_votes', table => {
          table.increments();
          table
            .integer('user_id')
            .unsigned()
            .notNullable();
          table.foreign('user_id').references('users.id');
          table.enu('position', ['pro', 'con']).notNullable();
          table
            .integer('comment_id')
            .unsigned()
            .notNullable();
          table
            .foreign('comment_id')
            .references('comments.id')
            .onDelete('CASCADE');

          table.unique(['comment_id', 'user_id']);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('comment_votes')]);
};
