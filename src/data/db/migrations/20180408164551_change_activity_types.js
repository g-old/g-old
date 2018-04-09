exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .raw(
        `
     ALTER TABLE "activities"
     DROP CONSTRAINT "activities_type_check"
   `,
      )
      .then(() =>
        knex('activities')
          .update({ type: 'message' })
          .where({ type: 'notification' }),
      )
      .then(() =>
        knex.schema.raw(`   ALTER TABLE "activities"
     ADD CONSTRAINT "activities_type_check"
     CHECK (type IN ('proposal', 'statement', 'like', 'vote', 'poll', 'message','discussion','comment', 'request', 'survey'))`),
      ),
  ]);
};

// prettier-ignore
exports.down = function(knex, Promise) {
   return Promise.all([knex.schema
       .raw(`
     ALTER TABLE "activities"
     DROP CONSTRAINT "activities_type_check"
   `)
       .then(() => knex('activities')
           .update({ type: 'notification' })
           .where({ type: 'message' }))
       .then(() => knex.schema.raw(`   ALTER TABLE "activities"
     ADD CONSTRAINT "activities_type_check"
     CHECK (type IN ('proposal', 'statement', 'like', 'vote', 'poll', 'notification','discussion','comment', 'request'))`))]);
};
