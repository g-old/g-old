exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('messages', table => {
      table
        .json('recipients')
        .notNullable()
        .defaultsTo('[]');
      table
        .enu('recipient_type', ['group', 'user'])
        .defaultsTo('user')
        .notNullable();
      table.enu('message_type', ['note', 'meeting', 'report']);
      table.jsonb('subject');
      table.boolean('enforce_email');
      table.integer('message_object_id');
      table.dropColumn('msg');
      table.dropColumn('title');
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
      table.dropColumn('enforce_email');
      table.dropColumn('message_type');
      table.dropColumn('message_object_id');
      table.dropColumn('subject');

      table.string('title');
      table.text('msg');
      table.string('location');
      table.string('date');
      table.enu('type', ['msg', 'event']);
    }),
  ]);
};
