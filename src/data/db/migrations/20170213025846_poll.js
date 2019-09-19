exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('polls').then(exists => {
      if (!exists) {
        return knex.schema.createTable('polls', table => {
          table.increments();
          table
            .integer('polling_mode_id')
            .unsigned()
            .notNullable();
          table.foreign('polling_mode_id').references('polling_modes.id');
          table
            .boolean('secret')
            .notNullable()
            .defaultsTo(false);
          table
            .integer('threshold')
            .unsigned()
            .notNullable();
          table
            .integer('upvotes')
            .unsigned()
            .defaultsTo(0);
          table
            .integer('downvotes')
            .unsigned()
            .defaultsTo(0);
          table
            .integer('num_voter')
            .unsigned()
            .defaultsTo(0);
          table.timestamp('start_time');
          table.timestamp('end_time');
          table.timestamp('closed_at');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('polls')]);
};
