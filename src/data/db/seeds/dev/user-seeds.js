/* eslint-disable no-bitwise */
const bcrypt = require('bcrypt');
const faker = require('faker');
const DataBatcher = require('../oldseeds/DataBatcher');
const Groups = require('../oldseeds/groups');

const DEFAULT_PASSWORD = 'password';

class UserFaker {
  constructor(props, knex) {
    this.password = props.password || DEFAULT_PASSWORD;
    this.defaultGroups =
      props.defaultGroups || Groups.GUEST | Groups.VIEWER | Groups.USER;
    this.increaseFn =
      props.increaseFn ||
      // eslint-disable-next-line func-names
      function(index) {
        return `_${index}`;
      };

    this.db = new DataBatcher(data =>
      knex.batchInsert('users', data).returning('id'),
    );
  }

  async init() {
    this.passwordHash = await bcrypt.hash(this.password, 10);
  }

  createName(prefix, index) {
    if (!prefix) {
      return faker.name.firstName();
    }
    return prefix + this.increaseFn(index);
  }

  createEmail(prefix, index) {
    if (!prefix) {
      return faker.internet.email();
    }
    return `${prefix + this.increaseFn(index)}@example.com`;
  }

  createUsers(
    {
      name,
      surname = faker.name.lastName(),
      email,
      groups,
      canVoteSince,
      emailVerified,
    },
    amount = 1,
  ) {
    const now = new Date();
    const result = [];
    const increase = amount > 1;

    for (let i = 0; i < amount; i += 1) {
      const userName = increase
        ? this.createName(name, i)
        : name || faker.name.firstName();
      result.push({
        name: userName,
        surname,
        password_hash: this.passwordHash,
        email: increase
          ? this.createEmail(email || name, i)
          : email || faker.internet.email(),
        groups: groups || this.defaultGroups,
        can_vote_since: canVoteSince || now,
        created_at: now,
        updated_at: now,
        email_verified: emailVerified || true,
        thumbnail: `https://api.adorable.io/avatars/32/${userName}${surname}.io.png`,
      });
    }
    return result;
  }

  createAndStoreUsers(props, amount) {
    const users = this.createUsers(props, amount);
    return this.db
      .insertMany(users)
      .then(ids => ids.map((id, index) => ({ ...users[index], id })));
  }
}

exports.seed = async function seed(knex, Promise) {
  const userFaker = new UserFaker({}, knex);
  await userFaker.init();
  const adminGroups =
    Groups.GUEST |
    Groups.VIEWER |
    Groups.VOTER |
    Groups.RELATOR |
    Groups.MEMBER_MANAGER |
    Groups.ADMIN;
  const admin = userFaker.createAndStoreUsers({
    name: 'admin',
    groups: adminGroups,
    email: 'admin@example.com',
  });

  const superuserGroups = Groups.SUPER_USER;

  const superuser = userFaker.createAndStoreUsers({
    name: 'superuser',
    groups: superuserGroups,
    email: 'superuser@example.com',
  });

  const modGroups =
    Groups.GUEST | Groups.VIEWER | Groups.VOTER | Groups.MODERATOR;

  const mods = userFaker.createAndStoreUsers(
    { name: 'mod', groups: modGroups },
    4,
  );

  const testUsers = userFaker.createAndStoreUsers({ name: 'user' }, 4);

  const users = userFaker.createAndStoreUsers({}, 30);

  const testViewers = userFaker.createAndStoreUsers(
    { name: 'viewer', groups: Groups.GUEST | Groups.VIEWER },
    4,
  );
  const viewers = userFaker.createAndStoreUsers(
    { groups: Groups.GUEST | Groups.VIEWER },
    20,
  );
  const testGuests = userFaker.createAndStoreUsers(
    { name: 'guests', groups: Groups.GUEST | Groups.VIEWER },
    4,
  );
  const guests = userFaker.createAndStoreUsers(
    { groups: Groups.GUEST | Groups.VIEWER },
    10,
  );

  return Promise.all([
    admin,
    superuser,
    mods,
    testUsers,
    users,
    viewers,
    testViewers,
    guests,
    testGuests,
  ]);
};
