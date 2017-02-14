exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('votes', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users.id');
      table.integer('proposal_id').unsigned().notNullable();
      table.foreign('proposal_id').references('proposals.id');
      table.enu('position', ['pro', 'con']).notNullable();
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('votes'),
  ]);
};
