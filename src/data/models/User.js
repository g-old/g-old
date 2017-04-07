import bcrypt from 'bcrypt';
import knex from '../knex.js';
import { validateEmail } from '../../core/helpers';
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return viewer.id === data.id || viewer.role === 'admin' || viewer.role === 'mod';
}

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.surname = data.surname;
    this.email = data.email;
    this.role_id = data.role_id;
    this.avatar = data.avatar_path;
  }
  static async gen(viewer, id, { users }) {
    const data = await users.load(id);

    if (data == null) return null;
    if (viewer.id == null) return null;
    const canSee = checkCanSee(viewer, data);
    if (!canSee) data.email = null;
    return new User(data);
    // return canSee ? new User(data) : new User(data.email = null);
  }

  static async followees(id, { followees }) {
    const data = await followees.load(id);
    return data;
    /*  return Promise.resolve(knex('user_follows')
    .where({ follower_id: id }).pluck('followee_id')
    .then(ids => {return ids; }));
      */
  }

  static async vote(id, pollId) {
    const data = await knex('votes').where({ user_id: id, poll_id: pollId }).select('id');
    return data;
    /*  return Promise.resolve(knex('user_follows')
    .where({ follower_id: id }).pluck('followee_id')
    .then(ids => {return ids; }));
      */
  }
  // eslint-disable-next-line no-unused-vars
  static canMutate(viewer, data) {
    // TODO Allow mutation of own data - attention to guests
    return ['admin', 'mod'].includes(viewer.role);
  }

  static async update(viewer, data, loaders) {
    // authenticate
    if (!User.canMutate(viewer, data)) return null;
    // validate

    // update
    await knex.transaction(async trx => {
      await trx
        .where({
          id: data.id,
        })
        .update({ role_id: data.roleId })
        .into('users');
    });
    return User.gen(viewer, data.id, loaders) || null;
  }

  static async create(data) {
    // authenticate
    // validate
    let { name, surname, email, password } = data;

    name = name.trim();
    if (!name) return null;
    surname = surname.trim();
    if (!surname) return null;
    email = email.trim().toLowerCase();
    if (!email) return null;
    if (!validateEmail(email)) return null;
    password = password.trim();
    if (!password) return null;
    if (password.length < 6) return null;
    // create
    // TODO check if locking with forUpdate is necessary (duplicate emails)
    const newUserId = await knex.transaction(async trx => {
      const hash = await bcrypt.hash(data.password, 10);
      if (!hash) throw Error('Something went wrong');
      const id = await trx
        .insert(
        {
          name,
          surname,
          email,
          email_validated: false,
          password_hash: hash,
          role_id: 4, // TODO make better
          created_at: new Date(),
        },
          'id',
        )
        .into('users');
      return id[0];
    });
    if (!newUserId) return null;
    return new User({
      id: newUserId,
      name: data.name,
      surname: data.surname,
      role_id: 4,
      email: data.email,
    });
  }
}

export default User;
