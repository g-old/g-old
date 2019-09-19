exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('tags').then(exists => {
      if (!exists) {
        return knex.schema.createTable('tags', table => {
          table.increments();
          table
            .string('text')
            .notNullable()
            .unique();
          table.integer('count').defaultsTo(0);
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('tags')]);
};
