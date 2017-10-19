exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('flagged_statements').then(exists => {
      if (!exists) {
        return knex.schema.createTable('flagged_statements', table => {
          table.increments();
          table
            .integer('flagger_id')
            .unsigned()
            .notNullable();
          table.foreign('flagger_id').references('users.id');
          table
            .integer('flagged_id')
            .unsigned()
            .notNullable();
          table.foreign('flagged_id').references('users.id');
          table
            .integer('statement_id')
            .unsigned()
            .notNullable()
            .unique();
          // table.foreign('statement_id').references('statements.id'); // to allow retracting
          table
            .integer('flag_count')
            .unsigned()
            .defaultsTo(0);
          table
            .integer('solver_id')
            .unsigned()
            .nullable();
          table.foreign('solver_id').references('users.id');
          table
            .enu('state', ['open', 'deleted', 'rejected'])
            .notNullable()
            .defaultsTo('open');
          table.text('content').notNullable();
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('flagged_statements')]);
};
