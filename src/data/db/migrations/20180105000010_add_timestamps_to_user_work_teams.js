exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('user_work_teams', table => {
      table.timestamp('created_at');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('user_work_teams', table => {
      table.dropColumn('created_at');
    }),
  ]);
};
