exports.up = function(knex) {
  return Promise.all([
    knex.raw('ALTER TABLE proposals ALTER COLUMN poll_one_id DROP NOT NULL'),
  ]);
};

exports.down = function() {
  return Promise.all([
    // knex.raw('ALTER TABLE proposals ALTER COLUMN poll_one_id SET NOT NULL'),
  ]);
};
