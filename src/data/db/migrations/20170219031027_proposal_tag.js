exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('proposal_tags').then(exists => {
      if (!exists) {
        return knex.schema.createTable('proposal_tags', table => {
          table.increments();
          table
            .integer('proposal_id')
            .unsigned()
            .notNullable();
          table.foreign('proposal_id').references('proposals');
          table
            .integer('tag_id')
            .unsigned()
            .notNullable();
          table.foreign('tag_id').references('tags');
          table.integer('count').defaultsTo(0);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('proposal_tags')]);
};
