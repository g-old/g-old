exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('communications').then(exists => {
      if (!exists) {
        return knex.schema.createTable('communications', table => {
          table.increments();
          table.integer('parent_id');
          table.text('text_html');
          table.text('text_raw');
          table.boolean('replyable');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('communications')]);
};
