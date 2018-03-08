exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('feeds').then(exists => {
      if (!exists) {
        return knex.schema.createTable('feeds', table => {
          table.increments();
          table
            .integer('user_id')
            .unsigned()
            .notNullable();
          table
            .foreign('user_id')
            .references('users.id')
            .onDelete('CASCADE');
          table.json('activity_ids').defaultsTo('[]');
          table.json('history');

          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('feeds')]);
};
