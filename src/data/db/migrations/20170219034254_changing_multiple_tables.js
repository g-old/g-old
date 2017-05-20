exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('proposals', (table) => {
      table.integer('poll_one_id').unsigned().notNullable().unique();
      table.foreign('poll_one_id').references('polls.id');
      table.integer('poll_two_id').unsigned().unique();
      table.foreign('poll_two_id').references('polls.id');
    }),
    knex.schema.table('votes', (table) => {
      table.integer('poll_id').unsigned().notNullable();
      table.foreign('poll_id').references('polls.id');
    }),
    knex.schema.table('statements', (table) => {
      table.integer('vote_id').unsigned().notNullable();
      table.foreign('vote_id').references('votes.id').onDelete('CASCADE');
      table.integer('poll_id').unsigned().notNullable();
      table.foreign('poll_id').references('polls.id');
    }),
    knex.schema.renameTable('likes', 'statement_likes'),
    knex.schema.renameTable('likes_id_seq', 'statement_likes_id_seq'),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('proposals', (table) => {
      table.dropColumn('poll_one_id');
      table.dropColumn('poll_two_id');
    }),
    knex.schema.table('votes', (table) => {
      table.dropColumn('poll_id');
    }),
    knex.schema.table('statements', (table) => {
      table.dropColumn('vote_id');
      table.dropColumn('poll_id');
    }),
    knex.schema.renameTable('statement_likes', 'likes'),
  ]);
};
