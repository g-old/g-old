exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('discussions').then(exists => {
      if (!exists) {
        return knex.schema.createTable('discussions', table => {
          table.increments();
          table.text('text').notNullable();
          table.text('text_html').notNullable();

          table.string('title').notNullable();
          table
            .integer('group_id')
            .unsigned()
            .notNullable();
          table.foreign('group_id').references('groups.id');
          table
            .integer('author_id')
            .unsigned()
            .notNullable();
          table.foreign('author_id').references('users.id');
          table
            .integer('num_comments')
            .unsigned()
            .defaultsTo(0);
          table.timestamp('closed_at').defaultsTo(null);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('discussions')]);
};
