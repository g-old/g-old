exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('activities', table => {
      table.integer('subject_id').defaultsTo(null);
      table.enu('subject_type', ['proposal', 'discussion', 'survey']);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('activities', table => {
      table.dropColumn('subject_id');
      table.dropColumn('subject_type');
    }),
  ]);
};
