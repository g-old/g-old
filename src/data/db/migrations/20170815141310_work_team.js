exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('work_teams', (table) => {
      table.increments();
      table.integer('coordinator_id').unsigned();
      table.foreign('coordinator_id').references('users.id');
      table.string('name').notNullable().unique();
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTable('work_teams')]);
};
