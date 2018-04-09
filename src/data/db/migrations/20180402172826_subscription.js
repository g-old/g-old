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
            .enu('target_type', [
              'group',
              'user',
              'proposal',
              'survey',
              'discussion',
            ])
            .notNullable();
          table.integer('target_id').notNullable();
          table.enu('subscription_type', ['no', 'followees', 'all', 'updates']);
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
