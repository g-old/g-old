exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('comments').then(exists => {
      if (!exists) {
        return knex.schema.createTable('comments', table => {
          table.increments();
          table.text('content').notNullable();
          table
            .integer('discussion_id')
            .unsigned()
            .notNullable();
          table.foreign('discussion_id').references('discussions.id');
          table
            .integer('author_id')
            .unsigned()
            .notNullable();
          table.foreign('author_id').references('users.id');
          table.integer('parent_id').unsigned();
          table
            .foreign('parent_id')
            .references('comments.id')
            .onDelete('CASCADE');
          table
            .integer('num_replies')
            .unsigned()
            .notNullable()
            .defaultsTo(0);
          table.timestamps();
          table.timestamp('edited_at');
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('comments')]);
};
