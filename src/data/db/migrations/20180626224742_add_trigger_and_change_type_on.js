exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('webpush_subscriptions', table => {
      table.dropForeign('user_id');
      table
        .foreign('user_id')
        .references('users.id')
        .onDelete('CASCADE');
    }),
    knex.raw(
      'ALTER TABLE webpush_subscriptions ALTER COLUMN endpoint SET DATA TYPE text ;',
    ),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('webpush_subscriptions', table => {
      table.dropForeign('user_id');
      table.foreign('user_id').references('users.id');
    }),
    knex.raw(
      'ALTER TABLE webpush_subscriptions ALTER COLUMN endpoint SET DATA TYPE varchar ;',
    ),
  ]);
};
