
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('roles', (table) => {
      table.integer('id').primary().notNullable();
      table.string('type').notNullable();
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('roles'),
  ]);
};
