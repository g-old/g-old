exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('notes').then(exists => {
      if (!exists) {
        return knex.schema.createTable('notes', table => {
          table.increments();
          table.jsonb('text_html');
          table.jsonb('raw_input');
          table.enu('category', ['groups', 'circular']);
          table.string('keyword');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('notes')]);
};
