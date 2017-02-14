
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('proposal_tags', (table) => {
      table.increments();
      table.integer('proposal_id').unsigned().notNullable();
      table.foreign('proposal_id').references('proposals');
      table.integer('tag_id').unsigned().notNullable();
      table.foreign('tag_id').references('tags');
      table.integer('count').defaultsTo(0);
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('porposal_tags'),
  ]);
};
