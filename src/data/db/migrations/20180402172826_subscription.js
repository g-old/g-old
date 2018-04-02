exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('subscriptions').then(exists => {
      if (!exists) {
        return knex.schema.createTable('subscriptions', table => {
          table.increments();
          table.integer('user_id').notNullable();
          table
            .foreign('user_id')
            .references('users.id')
            .onDelete('CASCADE');
          table
            .enu('event_type', [
              'new_proposal',
              'new_discussion',
              'new_statement',
              'new_comment',
            ])
            .notNullable();
          table.integer('target_id').notNullable();
          table.enu('subscription_type', ['no', 'followees', 'all']);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('subscriptions')]);
};
