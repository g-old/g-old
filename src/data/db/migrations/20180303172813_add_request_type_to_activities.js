exports.up = function(knex) {
  return Promise.all([
    knex.schema.raw(`
     ALTER TABLE "activities"
     DROP CONSTRAINT "activities_type_check",
     ADD CONSTRAINT "activities_type_check"
     CHECK (type IN ('proposal', 'statement', 'like', 'vote', 'poll', 'notification','discussion','comment', 'request'))
   `),
  ]);
};

// prettier-ignore
exports.down = function() {
  return Promise.all([]);
};
