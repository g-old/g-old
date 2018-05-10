exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable('notification_settings').then(exists => {
      if (!exists) {
        return knex.schema
          .createTable('notification_settings', table => {
            table.increments();
            table
              .integer('user_id')
              .unique()
              .notNullable();
            table
              .foreign('user_id')
              .references('users.id')
              .onDelete('CASCADE');
            table.jsonb('settings').defaultsTo('{}');
            table.timestamps();
          })
          .then(() =>
            knex('users')
              .pluck('id')
              .then(ids =>
                ids.map(id =>
                  knex('notification_settings')
                    .insert({ user_id: id })
                    .return(),
                ),
              ),
          );
      }
      return null;
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('notification_settings')]);
};
