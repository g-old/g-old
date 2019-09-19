exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('activities', table => {
      table.integer('subject_id').unsigned();
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('activities', table => {
      table.dropColumn('subject_id');
    }),
  ]);
};
