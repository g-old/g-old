exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.raw(`
     ALTER TABLE "requests"
     DROP CONSTRAINT "requests_type_check",
     ADD CONSTRAINT "requests_type_check"
     CHECK (type IN ('joinWT', 'joinGroup', 'changeEmail', 'changeAvatar', 'changeName'))
   `),
  ]);
};

// prettier-ignore
exports.down = function(knex, Promise) {
  return Promise.all(
    []
  );
};
