
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('statements', (table) => {
      table.increments();
      table.integer('author_id').unsigned().notNullable();
      table.foreign('author_id').references('users.id');
      table.integer('proposal_id').unsigned().notNullable();
      table.foreign('proposal_id').references('proposals.id');
      table.string('title').notNullable();
      table.text('body').notNullable();
      table.enu('position', ['pro', 'con']).notNullable();
      table.integer('likes').defaultsTo(0);
      table.timestamp('deleted_at');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('statements'),
  ]);
};
