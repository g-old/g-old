exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('user_follows', (table) => {
      table.increments();
      table.integer('follower_id').unsigned().notNullable();
      table.foreign('follower_id').references('users.id');
      table.integer('followee_id').unsigned().notNullable();
      table.foreign('followee_id').references('users.id');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('user_follows'),
  ]);
};
