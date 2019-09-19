exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('notifications').then(exists => {
      if (!exists) {
        return knex.schema.createTable('notifications', table => {
          table.increments();
          table.integer('user_id').notNullable();
          table
            .foreign('user_id')
            .references('users.id')
            .onDelete('CASCADE');
          table.bool('read').defaultsTo(false);
          table.integer('activity_id').notNullable();
          table.foreign('activity_id').references('activities.id');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('notifications')]);
};
