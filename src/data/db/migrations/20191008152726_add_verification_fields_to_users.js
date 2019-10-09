exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('users', table => {
      table
        .enu('verification_status', [
          'denied',
          'pending',
          'confirmed',
          'unrequested',
        ])
        .notNullable()
        .defaultsTo('unrequested');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('users', table => {
      table.dropColumn('verification_status');
    }),
  ]);
};
