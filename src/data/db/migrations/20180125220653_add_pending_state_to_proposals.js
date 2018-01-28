exports.up = function(knex, Promise) {
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

exports.down = function(knex, Promise) {
  return Promise.all([]);
};
