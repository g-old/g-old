exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('platform_settings').then(exists => {
      if (!exists) {
        return knex.schema.createTable('platform_settings', table => {
          table.increments();
          table
            .json('settings')
            .notNullable()
            .defaultsTo('{}');
          table.string('email');
          table.bool('gold_mode').defaultsTo(true);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('platform_settings')]);
};
