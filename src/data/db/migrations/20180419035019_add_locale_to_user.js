exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('users', table => {
      table.enu('locale', ['it-IT', 'de-DE', 'lld-IT']).defaultsTo('it-IT');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('users', table => {
      table.dropColumn('locale');
    }),
  ]);
};
