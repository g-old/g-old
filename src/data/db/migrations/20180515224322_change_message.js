exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('messages', table => {
      table
        .json('recipients')
        .notNullable()
        .defaultsTo('[]');
      table.enu('recipient_type', ['group', 'user']);
      table.text('message_html');
      table.renameColumn('msg', 'message');

      table.renameColumn('title', 'subject');
      table.dropColumn('location');
      table.dropColumn('date');
      table.dropColumn('type');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('messages', table => {
      table.dropColumn('recipients');
      table.dropColumn('recipient_type');
      table.dropColumn('message_html');
      table.renameColumn('subject', 'title');
      table.renameColumn('message', 'msg');

      table.string('location');
      table.string('date');
      table.enu('type', ['msg', 'event']);
    }),
  ]);
};
