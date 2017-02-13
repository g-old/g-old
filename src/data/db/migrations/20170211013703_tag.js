
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('tags', (table) => {
      table.increments();
      table.string('text').notNullable();
      table.integer('count').defaultsTo(0);
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('tags'),
  ]);
};
