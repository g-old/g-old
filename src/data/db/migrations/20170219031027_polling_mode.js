exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('polling_modes', (table) => {
      table.increments();
      table.string('name').notNullable();
      table.string('description');
      table.boolean('unipolar').notNullable();
      table.boolean('with_statements').notNullable();
      table.enu('threshold_ref', ['all', 'voters']).notNullable();
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('polling_modes'),
  ]);
};
