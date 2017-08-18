exports.up = function (knex) {
  return knex.schema.table('proposals', (table) => {
    table.dropColumn('spokesman');
    table.integer('spokesman_id').unsigned();
    table.foreign('spokesman_id').references('users.id');
  });
};

exports.down = function (knex) {
  return knex.schema.table('proposals', (table) => {
    table.dropForeign('spokesman_id');
    table.dropColumn('spokesman_id');
    table.string('spokesman');
  });
};
