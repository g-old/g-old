
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('quorums'),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('quorums', (table) => {
      table.increments();
      table.string('name').notNullable().unique();
      table.integer('percentage').notNullable();
      table.enu('pool', ['all', 'voters']);
    }),
  ]);
};
