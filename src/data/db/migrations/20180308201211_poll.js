exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('polls').then(exists => {
      if (!exists) {
        return knex.schema.createTable('polls', table => {
          table.increments();
          table.integer('group_id').notNullable();
          table.foreign('group_id').references('groups.id');
          table.integer('phase_id').notNullable();
          table.foreign('phase_id').references('phases.id');

          table
            .integer('polling_mode_id')
            .unsigned()
            .notNullable();
          table.foreign('polling_mode_id').references('polling_modes.id');
          table.timestamp('start_time');
          table.timestamp('end_time');
          table.timestamp('closed_at');

          table
            .boolean('secret')
            .notNullable()
            .defaultsTo(false);
          table
            .integer('threshold')
            .unsigned()
            .notNullable();
          table
            .integer('num_voter')
            .unsigned()
            .defaultsTo(0);
          table.json('votes_cache').defaultsTo('[]');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('polls')]);
};
