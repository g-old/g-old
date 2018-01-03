exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('requests').then(exists => {
      if (!exists) {
        return knex.schema.createTable('requests', table => {
          table.increments();
          table.json('content').notNullable();
          table
            .integer('requester_id')
            .unsigned()
            .notNullable();
          table.foreign('requester_id').references('users.id');
          table.integer('processor_id').unsigned();
          table.foreign('processor_id').references('users.id');
          table.enu('type', [
            'joinGroup',
            'joinWT',
            'nameChange',
            'avatarChange',
          ]);
          table.timestamp('denied_at');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('requests')]);
};
