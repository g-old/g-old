exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('users', table => {
      table.renameColumn('avatar_path', 'thumbnail');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('users', table => {
      table.renameColumn('thumbnail', 'avatar_path');
    }),
  ]);
};
