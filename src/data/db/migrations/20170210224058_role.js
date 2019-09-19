exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('roles').then(exists => {
      if (!exists) {
        return knex.schema.createTable('roles', table => {
          table
            .integer('id')
            .primary()
            .notNullable();
          table.string('type').notNullable();
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('roles')]);
};
