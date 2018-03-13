exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('plattform_settings').then(exists => {
      if (!exists) {
        return knex.schema.createTable('plattform_settings', table => {
          table.increments();
          table
            .json('settings')
            .notNullable()
            .defaultsTo('{}');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('plattform_settings')]);
};
