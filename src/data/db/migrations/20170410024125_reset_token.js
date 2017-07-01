exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('reset_tokens', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable().unique();
      table.foreign('user_id').references('users.id');
      table.string('token');
      table.timestamp('token_expires').notNullable();

      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTable('reset_tokens')]);
};
