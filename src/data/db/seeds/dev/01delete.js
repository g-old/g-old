/* eslint-disable comma-dangle */
exports.seed = function deleteUsers(knex, Promise) {
  const deleteQueue = [
    knex('users')
      .del()
      .then(() => knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1;')),
  ];

  return Promise.each(deleteQueue, () =>
    console.info('deleting entries in table ... '),
  );
};
