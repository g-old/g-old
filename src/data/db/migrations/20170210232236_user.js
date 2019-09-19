exports.up = function(knex) {
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
          table.string('avatar_path');
          table
            .boolean('email_verified')
            .notNullable()
            .defaultsTo(false);
          table.string('password_hash');
          table
            .integer('role_id')
            .unsigned()
            .notNullable();
          table.foreign('role_id').references('roles.id');
          table.integer('privilege').defaultsTo(1);
          table.timestamp('last_login_at');
          table.timestamps();
          table.timestamp('deleted_at'); // defaultTo(knex.raw('now()')).notNullable();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('users')]);
};
