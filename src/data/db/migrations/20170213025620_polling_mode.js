exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('polling_modes').then(exists => {
      if (!exists) {
        return knex.schema.createTable('polling_modes', table => {
          table.increments();
          table.integer('owner_id').notNullable();
          table
            .foreign('owner_id')
            .references('groups.id')
            .onDelete('CASCADE');
          table.jsonb('names').notNullable();
          table.boolean('inheritable').defaultsTo('false');
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

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('polling_modes')]);
};
