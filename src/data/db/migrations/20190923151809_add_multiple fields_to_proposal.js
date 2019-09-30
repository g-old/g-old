exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('proposals', table => {
      table.text('summary');
      table.string('image');
      table.integer('approval_state').defaultsTo(0);
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('proposals', table => {
      table.dropColumn('summary');
      table.dropColumn('image');
      table.dropColumn('approval_state');
    }),
  ]);
};
