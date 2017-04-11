exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('password_resets', table => {
      table.increments();
      table.integer('user_id').unsigned().notNullable().unique();
      table.foreign('user_id').references('users.id');
      table.string('reset_password_token');
      table.timestamp('reset_password_expires').notNullable();

      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTable('password_resets')]);
};
