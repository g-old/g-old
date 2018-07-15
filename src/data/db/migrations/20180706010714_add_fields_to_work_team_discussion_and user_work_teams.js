exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user_work_teams', table => {
      table.boolean('inactive').defaultsTo('false');
      table.timestamp('updated_at');
    }),
    knex.schema.table('work_teams', table => {
      table.timestamp('deleted_at');
    }),
    knex.schema.table('discussions', table => {
      table.timestamp('deleted_at');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user_work_teams', table => {
      table.dropColumn('updated_at');
      table.dropColumn('inactive');
    }),
    knex.schema.table('work_teams', table => {
      table.dropColumn('deleted_at');
    }),
    knex.schema.table('discussions', table => {
      table.dropColumn('deleted_at');
    }),
  ]);
};
