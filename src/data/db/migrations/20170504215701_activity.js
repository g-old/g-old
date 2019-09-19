exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('activities').then(exists => {
      if (!exists) {
        return knex.schema.createTable('activities', table => {
          table.increments();
          table
            .integer('actor_id')
            .unsigned()
            .notNullable(); // or json?
          table
            .enu('verb', [
              'create',
              'delete',
              'close',
              'update',
              'accept',
              'reject',
            ])
            .notNullable();
          table
            .enu('type', ['proposal', 'statement', 'like', 'vote', 'poll'])
            .notNullable();
          table
            .integer('object_id')
            .unsigned()
            .notNullable(); // or json?
          table.json('content');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('activities')]);
};
