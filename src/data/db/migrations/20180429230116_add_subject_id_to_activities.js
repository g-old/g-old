exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('activities', table => {
      table.integer('subject_id').unsigned();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('activities', table => {
      table.dropColumn('subject_id');
    }),
  ]);
};
