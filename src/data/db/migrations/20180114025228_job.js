exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('jobs').then(exists => {
      if (!exists) {
        return knex.schema.createTable('jobs', table => {
          table.increments();
          table.json('data').notNullable();
          table
            .integer('status')
            .unsigned()
            .notNullable();
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('jobs')]);
};
