exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('system_feeds').then(exists => {
      if (!exists) {
        return knex.schema.createTable('system_feeds', table => {
          table.increments();
          table
            .integer('groups_id')
            .unsigned()
            .notNullable();
          table
            .foreign('groups_id')
            .references('groups.id')
            .onDelete('CASCADE');
          table.jsonb('main_activities').defaultsTo('[]');
          table.jsonb('activities').defaultsTo('[]');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('system_feeds')]);
};
