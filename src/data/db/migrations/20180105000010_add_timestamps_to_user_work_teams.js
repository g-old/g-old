exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user_work_teams', table => {
      table.timestamp('created_at');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user_work_teams', table => {
      table.dropColumn('created_at');
    }),
  ]);
};
