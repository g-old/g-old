
import knex from '../knex.js';
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) { // TODO change data returned based on permissions
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
    if (viewer == null) return null;
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
}

export default User;
