exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('proposals').then(exists => {
      if (!exists) {
        return knex.schema.createTable('proposals', table => {
          table.increments();
          table
            .integer('author_id')
            .unsigned()
            .notNullable();
          table.foreign('author_id').references('users.id');
          table.string('title').notNullable();
          table.text('text').notNullable();
          table.text('text_html').notNullable();
          table
            .integer('current_phase_id')
            .unsigned()
            .notNullable();
          table
            .enu('state', [
              'proposed',
              'voting',
              'accepted',
              'rejected',
              'revoked',
              'deleted',
              'survey',
            ])
            .notNullable()
            .defaultsTo('proposed');
          table.integer('votes').defaultsTo(0);
          table.integer('spokesman_id').unsigned();
          table.foreign('spokesman_id').references('users.id');

          table.timestamp('deleted_at');
          table.timestamp('notified_at');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('proposals')]);
};
