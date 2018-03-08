exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('user_groups').then(exists => {
      if (!exists) {
        return knex.schema.createTable('user_groups', table => {
          table.increments();
          table.integer('user_id').notNullable();
          table
            .foreign('user_id')
            .references('users.id')
            .onDelete('CASCADE');
          table.integer('group_id').notNullable();
          table
            .foreign('group_id')
            .references('groups.id')
            .onDelete('CASCADE');
          table.integer('authorizer_id').notNullable();
          table.foreign('authorizer_id').references('users.id');
          table.jsonb('rights').defaultsTo('{}');
          table.unique(['group_id', 'user_id']);
          table.timestamps();
        });
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('user_groups')]);
};
