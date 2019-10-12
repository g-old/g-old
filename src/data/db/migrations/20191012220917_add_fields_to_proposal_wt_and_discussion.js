exports.up = function(knex) {
  return Promise.all([
    knex.schema.raw(`
     ALTER TABLE "proposals"
     DROP CONSTRAINT "proposals_state_check",
     ADD CONSTRAINT "proposals_state_check"
     CHECK (state IN ('proposed',
                 'voting',
                 'accepted',
                 'rejected',
                 'revoked',
                 'deleted',
                 'survey',
                 'pending',
                 'working'))
   `),
    knex.schema.table('proposals', table => {
      table.integer('team_id').unsigned();
      table.foreign('team_id').references('work_teams.id');
    }),
    knex.schema.table('work_teams', table => {
      table.string('image');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.raw(`
     ALTER TABLE "proposals"
     DROP CONSTRAINT "proposals_state_check",
     ADD CONSTRAINT "proposals_state_check"
     CHECK (state IN ('proposed',
                 'voting',
                 'accepted',
                 'rejected',
                 'revoked',
                 'deleted',
                 'survey',
                 'pending'
                 ))
   `),
    knex.schema.table('users', table => {
      table.dropForeign('team_id');
      table.dropColumn('team_id');
    }),
    knex.schema.table('work_teams', table => {
      table.dropColumn('image');
    }),
  ]);
};
