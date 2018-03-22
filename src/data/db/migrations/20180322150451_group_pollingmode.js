exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('group_polling_modes').then(exists => {
      if (!exists) {
        return knex.schema.createTable('group_polling_modes', table => {
          table.increments();
          table.integer('group_id').notNullable();
          table
            .foreign('group_id')
            .references('groups.id')
            .onDelete('CASCADE');
          table.integer('polling_mode_id').notNullable();
          table
            .foreign('polling_mode_id')
            .references('polling_modes.id')
            .onDelete('CASCADE');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('group_polling_modes')]);
};
