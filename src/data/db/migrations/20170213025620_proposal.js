
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('proposals', (table) => {
      table.increments();
      table.integer('author_id').unsigned().notNullable();
      table.foreign('author_id').references('users.id');
      table.integer('quorum_id').unsigned().notNullable();
      table.foreign('quorum_id').references('quorums.id');
      table.string('title').notNullable();
      table.text('body').notNullable();
      table.enu('state', ['ask_vote', 'vote', 'confirmed', 'rejected', 'deleted']).notNullable().defaultsTo('ask_vote');
      table.integer('votes').defaultsTo(0);
      table.timestamp('vote_started_at').notNullable();
      table.timestamp('vote_ends_at').notNullable();
      table.timestamp('deleted_at');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('proposals'),
  ]);
};
