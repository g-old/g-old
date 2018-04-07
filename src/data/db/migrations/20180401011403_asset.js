exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('assets').then(exists => {
      if (!exists) {
        return knex.schema.createTable('assets', table => {
          table.increments();
          table.string('source').notNullable();
          table.enu('type', ['image', 'pdf']).notNullable();
          table.string('name');
          table.integer('author_id').notNullable();
          table.foreign('author_id').references('users.id');
          table.timestamp('deleted_at');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('assets')]);
};
