exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('verify_emails', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable().unique();
      table.foreign('user_id').references('users.id');
      table.string('verify_email_token');
      table.string('email').notNullable();
      table.timestamp('verify_email_expires').notNullable();

      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTable('verify_emails')]);
};
