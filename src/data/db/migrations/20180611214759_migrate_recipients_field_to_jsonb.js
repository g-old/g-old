exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw(
      'ALTER TABLE messages ALTER COLUMN recipients SET DATA TYPE jsonb USING recipients::jsonb;',
    ),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.raw(
      'ALTER TABLE messages ALTER COLUMN recipients SET DATA TYPE json USING recipients::json;',
    ),
  ]);
};
