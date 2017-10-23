import bcrypt from 'bcrypt';
import knex from '../knex';
import { validateEmail } from '../../core/helpers';
import { canChangeGroups, calcRights, Groups } from '../../organization';
import { canSee, canMutate, Models } from '../../core/accessControl';
import log from '../../logger';

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.surname = data.surname;
    this.email = data.email;
    this.groups = data.groups;
    this.thumbnail = data.thumbnail;
    this.emailVerified = data.email_verified;
    this.lastLogin = data.last_login_at;
    this.createdAt = data.created_at;
    this.canVoteSince = data.can_vote_since;
  }
  static async gen(viewer, id, { users }) {
    if (!id) return null;
    const data = await users.load(id);

    if (data == null) return null;
    if (viewer.id == null) return null;
    if (!canSee(viewer, data, Models.USER)) {
      // protected info
      data.email = null;
      data.last_login_at = null;
    }
    return new User(data);
  }

  static async followees(viewer, id, { followees }) {
    if (!viewer || !id || viewer.id !== id) return [];
    const data = await followees.load(id);
    return data;
  }

  static async vote(id, pollId) {
    const data = await knex('votes')
      .where({ user_id: id, poll_id: pollId })
      .select('id');
    return data;
  }

  async modifySessions() {
    /*  const serializedUser = JSON.stringify({
      user: {
        id: this.id,
        name: this.name,
        surname: this.surname,
        email: this.email,
        avatar: this.avatar, // TODO change!
        privilege: this.privilege,
        role: {
          id: role.id,
          type: role.type,
        },
      },
    }); */
    const oldSessions = await knex('sessions')
      .whereRaw("sess->'passport'->'user'->>'id'=?", [this.id])
      .select('sess', 'sid');
    const updates = oldSessions.map(data => {
      const session = data.sess;
      const rights = calcRights(this.groups);
      const newSession = {
        ...session,
        passport: {
          ...session.passport,
          user: {
            ...session.passport.user,
            groups: this.groups,
            permissions: rights.perm,
            privileges: rights.priv,
          },
        },
      };
      return knex('sessions')
        .where({ sid: data.sid })
        .update({ sess: JSON.stringify(newSession) });
    });
    // TODO UPDATE TO POSTGRES 9.6!!
    await Promise.all(updates);
    /* await knex.raw(
      "update sessions set sess = jsonb_set(sess::jsonb, '{passport}',?) where sess->'passport'->'user'->>'id'=?",
      [serializedUser, this.id],
    ); */
  }

  static async update(viewer, data, loaders) {
    // authenticate
    // throw Error('TESTERROR');
    const errors = [];
    if (!data.id) return { errors: ['Arguments missing'] };
    if (!canMutate(viewer, data, Models.USER))
      return { errors: ['Permission denied!'] };
    // validate - if something seems corrupted, return.
    if (data.email && !validateEmail(data.email))
      return { errors: ['Wrong argument'] };
    if (data.password && data.password.trim().length <= 6)
      return { errors: ['Wrong argument'] };
    if (data.passwordOld && data.passwordOld.trim().length <= 6)
      return { errors: ['Wrong argument'] };
    // TODO write fn which gets all the props with the right name
    // TODO Allow only specific updates, take car of role
    const newData = { updated_at: new Date() };
    if (data.email) {
      newData.email = data.email.trim();
      newData.email_verified = !!data.emailVerified;
    }
    if (data.name) {
      newData.name = data.name.trim();
    }
    if (data.surname) {
      newData.surname = data.surname.trim();
    }
    if (data.password) {
      if (data.passwordOld) {
        let passwordHash = await knex('users')
          .where({ id: data.id })
          .pluck('password_hash');
        passwordHash = passwordHash[0];
        const same = await bcrypt.compare(data.passwordOld, passwordHash);
        if (!same) {
          errors.push('passwordOld');
          return { user: null, errors };
        }
      }
      const hash = await bcrypt.hash(data.password, 10);
      if (!hash) throw Error('Hash generation failed');
      newData.password_hash = hash;
    }
    let userInDB;

    if (data.groups != null) {
      // check i valid roles
      /* eslint-disable no-bitwise */
      const groups = Number(data.groups);
      // TODO make it a member method - pro -cons?
      userInDB = await User.gen(viewer, data.id, loaders);
      if (!canChangeGroups(viewer, userInDB, groups)) {
        log.warn({ data, viewer }, 'Group change denied!');
        return { user: null, errors: ['Permission denied'] };
      }

      if (
        (groups & Groups.VOTER) > 0 &&
        (userInDB.groups & Groups.VOTER) === 0
      ) {
        newData.can_vote_since = new Date();
      } else if (userInDB.groups & Groups.VOTER) {
        newData.can_vote_since = null;
      }

      newData.groups = groups;
    }

    // update
    let updatedId = null;
    try {
      updatedId = await knex.transaction(async trx => {
        // TODO log certain actions in a separate table (role changes, rights, deletions)

        if (data.followee) {
          // eslint-disable-next-line eqeqeq
          if (data.followee == viewer.id) {
            throw new Error('Permission denied');
          }
          // check if they are already following each others
          const followee = await trx
            .where({ follower_id: data.id, followee_id: data.followee })
            .pluck('id')
            .into('user_follows');
          if (followee[0]) {
            // delete
            await trx
              .where({ follower_id: data.id, followee_id: data.followee })
              .del()
              .into('user_follows');
          } else {
            // check if they are less than 5;
            const numFollowees = await trx
              .where({ follower_id: data.id })
              .count('id')
              .into('user_follows');

            if (numFollowees[0].count < 5) {
              await trx
                .insert({ follower_id: data.id, followee_id: data.followee })
                .into('user_follows');
            } else {
              throw Error('To many followees');
            }
          }
        }

        await trx
          .where({
            id: data.id,
          })
          .update(newData)
          .into('users');
        return data.id;
      });
    } catch (err) {
      if (err.code === '23505') {
        errors.push('email');
      } else {
        errors.push(err.message);
      }
      log.error({ err, viewer, data }, 'Update failed');
      return { user: null, errors };
    }
    if (!updatedId) return null;
    // invalidate cache
    loaders.users.clear(updatedId);
    // updates session store;
    const updatedUser = await User.gen(viewer, data.id, loaders);
    if (viewer.id !== updatedUser.id) {
      if (newData.groups || newData.email) {
        await updatedUser.modifySessions();
      }
    }

    //
    return {
      user: updatedUser || null,
      ...(userInDB && { oldUser: userInDB }),
      errors,
    };
  }

  static async create(viewer, data) {
    // authenticate
    // validate
    if (!data) return null;
    if (!canMutate(viewer, data, Models.USER)) return null;
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
    // eslint-disable-next-line camelcase
    // const thumbnail = `https://api.adorable.io/avatars/32/${name}${surname}.io.png`;
    // create
    // TODO check if locking with forUpdate is necessary (duplicate emails)
    const hash = await bcrypt.hash(data.password, 10);
    if (!hash) throw Error('Something went wrong');
    const newUserData = {
      name,
      surname,
      email,
      thumbnail: null,
      email_verified: false,
      password_hash: hash,
      groups: Groups.GUEST,
      created_at: new Date(),
    };
    const newUser = await knex.transaction(async trx => {
      const uData = await trx
        .insert(newUserData)
        .into('users')
        .returning('*');
      return uData[0];
    });
    if (!newUser) return null;
    return new User(newUser);
  }

  static async find(viewer, data, loaders) {
    if (!data) return null;
    // TODO validate data

    // Since checks are applied in the gen method, we can skip authorization for now
    const searchTerms = data.split(' ');
    return knex('users')
      .modify(queryBuilder => {
        if (searchTerms.length === 1) {
          queryBuilder
            .where('name', 'ilike', `${searchTerms[0]}%`)
            .orWhere('surname', 'ilike', `${searchTerms[0]}%`);
        } else if (searchTerms.length > 1) {
          queryBuilder
            .where(function() {
              this.where('name', 'ilike', `${searchTerms[0]}%`).orWhere(
                'surname',
                'ilike',
                `${searchTerms[1]}%`,
              );
            })
            .orWhere(function() {
              this.where('name', 'ilike', `${searchTerms[1]}%`).orWhere(
                'surname',
                'ilike',
                `${searchTerms[0]}%`,
              );
            });
        }
      })
      .pluck('id')
      .then(ids => ids.map(id => User.gen(viewer, id, loaders)));
  }

  static async delete(viewer, data) {
    const result = { user: null, errors: [] };
    if (!data || !data.id) {
      result.errors.push('Missing args');
      return result;
    }

    if (!canMutate(viewer, data, Models.USER)) {
      result.errors.push('Permission denied');
      return result;
    }
    let deletedUserData;
    try {
      deletedUserData = await knex.transaction(async trx => {
        const [userData] = await knex('users')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.id })
          .returning('*');

        if (!userData || userData.groups !== Groups.GUEST) {
          throw new Error(userData ? 'Permission denied' : 'User not found');
        }
        const rowCount = await knex('users')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.id })
          .del();

        if (rowCount < 1) {
          throw new Error('DB failure');
        }

        return userData;
      });
    } catch (err) {
      result.errors.push(err.message);
      log.error({ err, viewer, data }, 'Deletion failed');
    }

    if (deletedUserData) {
      result.user = new User(deletedUserData);
    }

    return result;
  }
}

export default User;
