exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('system_feeds', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.json('activity_ids');
      table.timestamps();
    }),
  ]);
};
exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTable('system_feeds')]);
};
