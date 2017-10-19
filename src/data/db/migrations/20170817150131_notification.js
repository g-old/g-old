exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('notifications').then(exists => {
      if (!exists) {
        return knex.schema.createTable('notifications', table => {
          table.increments();
          table.enu('type', ['msg', 'event']).notNullable();
          table.timestamp('date');
          table.string('location');
          table.text('msg').notNullable();
          table.string('title');
          table.integer('sender_id').unsigned();
          table.foreign('sender_id').references('users.id');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('notifications')]);
};
