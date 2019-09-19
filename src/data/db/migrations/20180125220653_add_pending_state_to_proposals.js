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
                 'pending'))
   `),
  ]);
};

exports.down = function() {
  return Promise.all([]);
};
