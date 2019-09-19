exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable('proposal_groups').then(exists => {
      if (!exists) {
        return knex.schema.createTable('proposal_groups', table => {
          table.increments();
          table.integer('group_id').notNullable();
          table.enu('group_type', ['WT', 'GROUP']).notNullable();
          table.integer('proposal_id').notNullable();
          table
            .foreign('proposal_id')
            .references('proposals.id')
            .onDelete('CASCADE');
          table.enu('state', ['EVALUATION', 'WAITING']).notNullable();
          table.unique(['group_id', 'group_type', 'proposal_id']);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('proposal_groups')]);
};
