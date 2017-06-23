exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('webpush_subscriptions', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users.id');
      table.string('endpoint').notNullable().unique();
      table.string('auth').notNullable();
      table.string('p256dh').notNullable();
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTable('webpush_subscriptions')]);
};
