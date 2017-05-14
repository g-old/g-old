exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('tags', (table) => {
      table.increments();
      table.string('text').notNullable().unique();
      table.integer('count').defaultsTo(0);
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTable('tags')]);
};
