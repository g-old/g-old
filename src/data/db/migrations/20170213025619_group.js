exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('groups').then(exists => {
      if (!exists) {
        return knex.schema.createTable('groups', table => {
          table.increments();
          table.integer('parent_group_id').unsigned();
          table.foreign('parent_group_id').references('groups.id');
          table.integer('coordinator_id').unsigned();
          table.foreign('coordinator_id').references('users.id');
          table.integer('owner_id').unsigned();
          table.foreign('owner_id').references('users.id');
          table.jsonb('names').notNullable();
          table.jsonb('about');
          table.jsonb('description');
          table.jsonb('engagement').defaultsTo('{}');
          table.bool('is_published');
          table.bool('gold_mode').notNullable();
          table.enu('privacy', ['open', 'closed']);
          table.string('icon');
          table.string('cover');
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('groups')]);
};
