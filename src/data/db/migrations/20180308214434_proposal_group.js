exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('proposal_groups').then(exists => {
      if (!exists) {
        return knex.schema.createTable('proposal_groups', table => {
          table.increments();
          table.integer('proposal_id').notNullable();
          table
            .foreign('proposal_id')
            .references('proposals.id')
            .onDelete('CASCADE');
          table.integer('group_id').notNullable();
          table
            .foreign('group_id')
            .references('groups.id')
            .onDelete('CASCADE');
          table.enu('state', ['pending', 'accepted']);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('proposal_groups')]);
};
