exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('user_follows').then(exists => {
      if (!exists) {
        return knex.schema.createTable('user_follows', table => {
          table.increments();
          table
            .integer('follower_id')
            .unsigned()
            .notNullable();
          table.foreign('follower_id').references('users.id');
          table
            .integer('followee_id')
            .unsigned()
            .notNullable();
          table.foreign('followee_id').references('users.id');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('user_follows')]);
};
