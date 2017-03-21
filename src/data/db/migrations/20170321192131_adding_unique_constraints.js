exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('votes', table => {
      table.unique(['poll_id', 'user_id']);
    }),
    knex.schema.alterTable('statement_likes', table => {
      table.unique(['user_id', 'statement_id']);
    }),
    knex.schema.alterTable('statements', table => {
      table.unique(['poll_id', 'author_id']);
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('votes', table => {
      table.dropUnique(['poll_id', 'user_id']);
    }),
    knex.schema.alterTable('statement_likes', table => {
      table.dropUnique(['user_id', 'statement_id']);
    }),
    knex.schema.alterTable('statements', table => {
      table.dropUnique(['poll_id', 'author_id']);
    }),
  ]);
};
