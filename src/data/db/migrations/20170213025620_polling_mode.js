exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('polling_modes').then(exists => {
      if (!exists) {
        return knex.schema.createTable('polling_modes', table => {
          table.increments();
          table.string('name').notNullable();
          table.string('description');
          table.boolean('unipolar').notNullable();
          table.boolean('with_statements').notNullable();
          table.enu('threshold_ref', ['all', 'voters']).notNullable();
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('polling_modes')]);
};
