exports.up = function (knex, Promise) {
  // RENAME to statement Likes
  return Promise.all([
    knex.schema.createTable('likes', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users.id');
      table.integer('statement_id').unsigned().notNullable();
      table.foreign('statement_id').references('statements.id');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('likes'),
  ]);
};
