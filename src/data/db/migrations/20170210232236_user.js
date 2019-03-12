exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('users').then(exists => {
      if (!exists) {
        return knex.schema.createTable('users', table => {
          table.increments();
          table.string('name').notNullable();
          table.string('surname').notNullable();
          table
            .string('email')
            .notNullable()
            .unique();
          table.string('thumbnail');
          table
            .boolean('email_verified')
            .notNullable()
            .defaultsTo(false);
          table.string('password_hash');
          table
            .integer('groups')
            .unsigned()
            .defaultsTo(0);
          table.enu('locale', ['it-IT', 'de-DE', 'lld-IT']).defaultsTo('de-DE');

          table.timestamp('last_login_at');
          table.timestamps();
          table.timestamp('deleted_at'); // defaultTo(knex.raw('now()')).notNullable();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('users')]);
};
