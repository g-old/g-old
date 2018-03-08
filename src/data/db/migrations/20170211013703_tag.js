exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('tags').then(exists => {
      if (!exists) {
        return knex.schema.createTable('tags', table => {
          table.increments();
          table.jsonb('text').notNullable();
          table.integer('count').defaultsTo(0);
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('tags')]);
};
