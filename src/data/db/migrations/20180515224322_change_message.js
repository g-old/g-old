exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('messages', table => {
      table
        .json('to')
        .notNullable()
        .defaultsTo('[]');
      table.enu('recipient_type', ['group', 'user']);
      table.text('msg_html');
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
      table.dropColumn('to');
      table.dropColumn('receiver_type');
      table.dropColumn('msg_html');
      table.renameColumn('subject', 'title');
      table.string('location');
      table.string('date');
      table.enu('type', ['msg', 'event']);
    }),
  ]);
};
