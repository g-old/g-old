exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('verifications').then(exists => {
      if (!exists) {
        return knex.schema.createTable('verifications', table => {
          table.increments();
          table.integer('verificator_id').unsigned();
          table.foreign('verificator_id').references('users.id');
          table
            .integer('user_id')
            .notNullable()
            .unsigned()
            .unique();
          table.foreign('user_id').references('users.id');
          table.string('file_path');
          table.string('id_hash').unique();
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('verifications')]);
};
