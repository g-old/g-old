exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('store').then(exists => {
      if (!exists) {
        return knex.schema.createTable('store', table => {
          table.integer('last_processed_activity_id').notNullable();
          table.enu('type', ['inbox', 'webpush', 'email']).notNullable();

          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('store')]);
};
