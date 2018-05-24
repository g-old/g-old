exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('notes').then(exists => {
      if (!exists) {
        return knex.schema.createTable('notes', table => {
          table.increments();
          table.integer('parent_id');
          table.jsonb('text_html');
          table.jsonb('raw_input');
          table.boolean('replies_allowed');

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
