exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw('ALTER TABLE proposals ALTER COLUMN poll_one_id DROP NOT NULL'),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    // knex.raw('ALTER TABLE proposals ALTER COLUMN poll_one_id SET NOT NULL'),
  ]);
};
