exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('feeds').then(exists => {
      if (!exists) {
        return knex.schema.createTable('feeds', table => {
          table.increments();
          table
            .integer('user_id')
            .unsigned()
            .notNullable();
          table.json('activity_ids');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('feeds')]);
};
