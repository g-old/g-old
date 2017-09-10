import bcrypt from 'bcrypt';
import knex from '../knex';
import { validateEmail } from '../../core/helpers';
import { PRIVILEGES } from '../../constants';
import Role from './Role';
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return (
    viewer.id === data.id ||
    viewer.role.type === 'admin' ||
    viewer.role.type === 'mod' ||
    viewer.role.type === 'system'
  );
}
const roles = ['admin', 'mod', 'user', 'viewer', 'guest'];

async function getIsLowerLevel(viewer, accountId) {
  const accountRole = await knex
    .from('roles')
    .innerJoin('users', 'users.role_id', 'roles.id')
    .where('users.id', '=', accountId)
    .select('type');
  const accountPos = roles.indexOf(accountRole[0].type);
  const viewerPos = roles.indexOf(viewer.role.type);
  return accountPos > viewerPos;
}

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.surname = data.surname;
    this.email = data.email;
    this.role_id = data.role_id;
    this.privilege = data.privilege;
    this.avatar = data.avatar_path;
    this.emailVerified = data.email_verified;
    this.lastLogin = data.last_login_at;
    this.createdAt = data.created_at;
  }
  static async gen(viewer, id, { users }) {
    if (!id) return null;
    const data = await users.load(id);

    if (data == null) return null;
    if (viewer.id == null) return null;
    const canSee = checkCanSee(viewer, data);
    if (!canSee) {
      // protected info
      data.email = null;
      data.last_login_at = null;
      data.privilege = null;
      data.role_id = null;
    }
    return new User(data);
    // return canSee ? new User(data) : new User(data.email = null);
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
    /*  return Promise.resolve(knex('user_follows')
    .where({ follower_id: id }).pluck('followee_id')
    .then(ids => {return ids; }));
      */
  }
  // eslint-disable-next-line no-unused-vars
  static canMutate(viewer, data) {
    // TODO Allow mutation of own data - attention to guests
    if (
      ['admin', 'mod', 'system', 'user', 'viewer', 'guest'].includes(
        viewer.role.type,
      )
    ) {
      // eslint-disable-next-line eqeqeq
      if (data.email && viewer.id != data.id) {
        return false;
      }
      // eslint-disable-next-line eqeqeq
      if (data.password && viewer.id != data.id) {
        return false;
      }
      return true;
    }
    return false;
  }

  async modifySessions(viewer, loaders) {
    const role = await Role.gen(viewer, this.role_id, loaders);
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
      const newSession = {
        ...session,
        passport: {
          ...session.passport,
          user: { ...session.passport.user, role },
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
    if (!data.id) return null;
    if (!User.canMutate(viewer, data)) return null;
    // validate - if something seems corrupted, return.
    if (data.email && !validateEmail(data.email)) return null;
    if (data.password && data.password.trim() > 6) return null;
    if (data.passwordOld && data.passwordOld.trim() > 6) return null;
    if (data.privilege && data.privilege < 1) return null;
    // TODO write fn which gets all the props with the right name
    // TODO Allow only specific updates, take car of role
    const errors = [];
    const newData = { updated_at: new Date() };
    if (data.email) {
      newData.email = data.email.trim();
      newData.email_verified = !!data.emailVerified;
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
      } else if (viewer.role.type !== 'system') return null; // password resets

      const hash = await bcrypt.hash(data.password, 10);
      if (!hash) return null;
      newData.password_hash = hash;
    }

    if (data.role) {
      const reg = new RegExp(data.role, 'i');
      const neededPrivilege = Object.keys(PRIVILEGES).find(key => {
        const res = reg.exec(key);
        return res !== null;
      });

      // TODO  implement check of workteams , email erification and img

      /* eslint-disable no-bitwise */
      if (
        neededPrivilege &&
        (viewer.privilege & PRIVILEGES[neededPrivilege] ||
          viewer.privilege & PRIVILEGES.canModifyRoles)
      ) {
        /* eslint-enable no-bitwise */
        // check level

        if (await getIsLowerLevel(viewer, data.id)) {
          // check if right level
          const roleId = roles.indexOf(data.role) + 1;

          if (roleId > -1) {
            newData.role_id = roleId;
          }
        }
      }
    }

    if (data.privilege) {
      // eslint-disable-next-line no-bitwise
      if (viewer.privilege & PRIVILEGES.canModifyRights) {
        // check if lower level
        if (await getIsLowerLevel(viewer, data.id)) {
          newData.privilege = data.privilege;
        }
      }
    }

    // update
    let updatedId = null;
    try {
      updatedId = await knex.transaction(async trx => {
        // TODO log certain actions in a separate table (role changes, rights, deletions)

        if (data.followee) {
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
    } catch (e) {
      if (e.code === '23505') {
        errors.push('email');
      } else {
        throw Error(e.message);
      }
      return { user: null, errors };
    }
    if (!updatedId) return null;
    // invalidate cache
    loaders.users.clear(updatedId);
    // updates session store;
    const updatedUser = await User.gen(viewer, data.id, loaders);
    if (viewer.id !== updatedUser.id) {
      if (newData.role_id || newData.privilege || newData.email) {
        await updatedUser.modifySessions(viewer, loaders);
      }
    }

    //
    return { user: updatedUser || null, errors };
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
    // eslint-disable-next-line camelcase
    const avatar_path = `https://api.adorable.io/avatars/32/${name}${surname}.io.png`;
    // create
    // TODO check if locking with forUpdate is necessary (duplicate emails)
    const hash = await bcrypt.hash(data.password, 10);
    if (!hash) throw Error('Something went wrong');
    const newUserData = {
      name,
      surname,
      email,
      avatar_path,
      email_verified: false,
      password_hash: hash,
      role_id: 5, // TODO make better
      created_at: new Date(),
      privilege: 1,
    };
    const newUser = await knex.transaction(async trx => {
      const uData = await trx.insert(newUserData).into('users').returning('*');
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
}

export default User;
