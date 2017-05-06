exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('activities', (table) => {
      table.increments();
      table.integer('actor_id').unsigned().notNullable(); // or json?
      table.enu('verb', ['create', 'delete', 'close', 'update', 'accept', 'reject']).notNullable();
      table.enu('type', ['proposal', 'statement', 'like', 'vote', 'poll']).notNullable();
      table.integer('object_id').unsigned().notNullable(); // or json?
      table.json('content');
      table.timestamps();
    }),
  ]);
};
exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTable('activities')]);
};
