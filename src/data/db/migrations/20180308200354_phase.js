exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('phases').then(exists => {
      if (!exists) {
        return knex.schema.createTable('phases', table => {
          table.increments();
          table.integer('previous_phase_id');
          table.integer('next_phase_id');
          table.enu('state', ['todo', 'active', 'done']).defaultsTo('todo');
          table.integer('proposal_id').unsigned();
          table.foreign('proposal_id').references('proposals.id');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('phases')]);
};
