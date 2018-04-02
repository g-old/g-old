exports.up = function(knex) {
  return knex.schema.renameTable('notifications', 'messages');
};

exports.down = function(knex) {
  return knex.schema.renameTable('messages', 'notifications');
};
