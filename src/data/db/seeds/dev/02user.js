const bcrypt = require('bcrypt');
const Factory = require('../user');

const Groups = {
  SUPER_USER: 1,
  ADMIN: 2,
  MEMBER_MANAGER: 4,
  MODERATOR: 32,
  GUEST: 256,
};

exports.seed = function seedUsers(knex, Promise) {
  /* eslint-disable comma-dangle, no-bitwise */

  const UserFactory = new Factory(knex);

  function createUsers() {
    const users = [];
    const testSuperUser = Promise.resolve(
      bcrypt.hash('password', 10).then(hash =>
        UserFactory.make({
          name: 'Superuser',
          surname: 'Superuser',
          passwordHash: hash,
          email: 'superuser@example.com',
          groups: Groups.SUPER_USER,
          emailVerified: false,
        }),
      ),
    );
    users.push(testSuperUser);
    const testAdmin = Promise.resolve(
      bcrypt.hash('password', 10).then(hash =>
        UserFactory.make({
          name: 'admin',
          surname: 'admin',
          passwordHash: hash,
          email: 'admin@example.com',
          groups:
            Groups.GUEST |
            Groups.MEMBER_MANAGER |
            Groups.MODERATOR |
            Groups.ADMIN,
          emailVerified: true,
        }),
      ),
    );
    users.push(testAdmin);
    return Promise.all(users);
  }

  return Promise.resolve(createUsers().catch(e => console.info(e)));
};
