exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('subscriptions', table => {
      table.unique(['user_id', 'target_type', 'target_id']);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.raw(`ALTER TABLE "subscriptions"
     DROP CONSTRAINT "subscriptions_user_id_target_type_target_id_unique"`),
  ]);
};
