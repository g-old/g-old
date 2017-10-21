exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('verify_tokens', table => {
      table.dropForeign('user_id');
      table
        .foreign('user_id')
        .references('users.id')
        .onDelete('CASCADE');
    }),
    knex.schema.table('reset_tokens', table => {
      table.dropForeign('user_id');
      table
        .foreign('user_id')
        .references('users.id')
        .onDelete('CASCADE');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('verify_tokens', table => {
      table.dropForeign('user_id');
      table.foreign('user_id').references('users.id');
    }),
    knex.schema.table('reset_tokens', table => {
      table.dropForeign('user_id');
      table.foreign('user_id').references('users.id');
    }),
  ]);
};
