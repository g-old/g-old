exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('proposal_voters').then(exists => {
      if (!exists) {
        return knex.schema.createTable('proposal_voters', table => {
          table.increments();
          table
            .integer('proposal_id')
            .unsigned()
            .notNullable();
          table.foreign('proposal_id').references('proposals.id');
          table
            .integer('user_id')
            .unsigned()
            .notNullable();
          table.foreign('user_id').references('users.id');
          table.unique(['proposal_id', 'user_id']);
          table.timestamp('created_at');
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('proposal_voters')]);
};
