exports.up = function(knex) {
  return Promise.all([
    knex.schema.raw(`
     ALTER TABLE "messages"
     DROP CONSTRAINT "messages_recipient_type_check",
     ADD CONSTRAINT "messages_recipient_type_check"
     CHECK (recipient_type IN ('user', 'group', 'all', 'role'))
   `),
  ]);
};

// prettier-ignore
exports.down = function(knex) {
  return Promise.all([knex.schema.raw(`
     ALTER TABLE "messages"
     DROP CONSTRAINT "messages_recipient_type_check";
   `)]);
};
