exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('reports').then(exists => {
      if (!exists) {
        return knex.schema.createTable('reports', table => {
          table.increments();
          table.jsonb('text_html');
          table.jsonb('raw_input');
          table.enu('category', ['groups']);
          table.string('keyword');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('reports')]);
};
