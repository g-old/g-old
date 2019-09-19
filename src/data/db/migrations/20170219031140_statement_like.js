exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('statement_likes').then(exists => {
      if (!exists) {
        return knex.schema.createTable('statement_likes', table => {
          table.increments();
          table
            .integer('user_id')
            .unsigned()
            .notNullable();
          table.foreign('user_id').references('users.id');
          table
            .integer('statement_id')
            .unsigned()
            .notNullable();
          table
            .foreign('statement_id')
            .references('statements.id')
            .onDelete('CASCADE');
          table.unique(['user_id', 'statement_id']);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('statement_likes')]);
};
