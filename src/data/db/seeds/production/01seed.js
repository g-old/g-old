const Factory = require('../user');

const SUPER_USER = 1;
exports.seed = function seedUsers(knex, Promise) {
  /* eslint-disable comma-dangle */
  const UserFactory = new Factory(knex);

  function createSuperUser() {
    const hash = '$2a$10$2ZX.2Lgicib1coH163pIH.WsQdCcEnqAyglEa.6LYTVHnFqEVlOhe';
    return UserFactory.make({
      name: 'Superuser',
      surname: 'Superuser',
      passwordHash: hash,
      email: 'superuser@example.com',
      groups: SUPER_USER,
      emailVerified: false,
    });
  }

  return Promise.resolve(createSuperUser().catch(e => console.info(e)));
};
