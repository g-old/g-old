// @flow
import bcrypt from 'bcrypt';
import knex from '../knex';
import { validateEmail } from '../../core/helpers';
import {
  canChangeGroups,
  calcRights,
  Groups,
  getUpdatedGroup,
} from '../../organization';
import { canSee, canMutate, Models } from '../../core/accessControl';
import log from '../../logger';
import EventManager from '../../core/EventManager';
import { transactify } from './utils';

const NOTIFICATION_FIELDS = [
  'proposal',
  'survey',
  'comment',
  'discussion',
  'update',
  'reply',
  'message',
  'statement',
];

export type UserProps = {
  id: ID,
  name: string,
  surname: string,
  email: string,
  groups: number,
  thumbnail: string,
  emailVerified: boolean,
  last_login_at: string,
  created_at: string,
  canVoteSince: ?string,
  locale: Locale,
};

const sanitizeName = name =>
  name
    ? name
        .split(' ')
        .map(n => {
          if (n.length < 4) {
            return n.trim();
          }
          return (
            n.charAt(0).toUpperCase() +
            n
              .slice(1)
              .toLowerCase()
              .trim()
          );
        })
        .join(' ')
    : name;
class User {
  id: ID;

  name: string;

  surname: string;

  email: string;

  groups: number;

  thumbnail: string;

  emailVerified: boolean;

  lastLogin: string;

  createdAt: string;

  canVoteSince: ?string;

  constructor(data: UserProps) {
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
    this.locale = data.locale;
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
    if (!canMutate(viewer, data, Models.USER)) {
      return { errors: ['Permission denied!'] };
    }
    // validate - if something seems corrupted, return.
    if (data.password && data.password.trim().length <= 6)
      return { errors: ['Wrong argument'] };
    if (data.passwordOld && data.passwordOld.trim().length <= 6)
      return { errors: ['Wrong argument'] };
    // TODO write fn which gets all the props with the right name
    // TODO Allow only specific updates, take care of role
    const newData = { updated_at: new Date() };
    if (data.email) {
      if (!validateEmail(data.email)) {
        return { errors: ['email-wrong-format'] };
      }
      newData.email = data.email.trim();
      // newData.email_verified = !!data.emailVerified;
    }
    if (data.emailVerified) {
      newData.email_verified = true;
    }
    if (data.name) {
      newData.name = sanitizeName(data.name);
    }
    if (data.surname) {
      newData.surname = sanitizeName(data.surname);
    }
    if (data.thumbnail) {
      newData.thumbnail = data.thumbnail;
    }
    if (data.locale && ['it-IT', 'de-DE', 'lld-IT'].includes(data.locale)) {
      newData.locale = data.locale;
    }
    if (data.notificationSettings) {
      // validate
      let validatedSettings;
      if (data.notificationSettings.length < 1024) {
        const parsedSettings = JSON.parse(data.notificationSettings);
        // check keys
        validatedSettings = Object.keys(parsedSettings).reduce(
          (acc, settingField) => {
            const validatedKey = NOTIFICATION_FIELDS.find(
              field => settingField === field,
            );
            if (!validatedKey) {
              errors.push(`Wrong key in NotificationSettings: ${settingField}`);
              return acc;
            }
            const params = parsedSettings[validatedKey];
            const validatedParams = {};
            if ('email' in params) {
              validatedParams.email = !!params.email;
            }
            if ('webpush' in params) {
              validatedParams.webpush = !!params.webpush;
            }
            acc[validatedKey] = validatedParams;
            return acc;
          },

          {},
        );
      }

      const [settingsData = null] = await knex('notification_settings')
        .where({ user_id: data.id })
        .select('settings');
      if (settingsData && settingsData.settings) {
        const { settings } = settingsData;
        // merge
        const newSettings = NOTIFICATION_FIELDS.reduce((acc, key) => {
          if (key in settings && key in validatedSettings) {
            // update
            const mergedValues = {
              ...settings[key],
              ...validatedSettings[key],
            };

            // filter disabled settings out
            Object.keys(mergedValues).forEach(property => {
              if (!mergedValues[property]) {
                delete mergedValues[property];
              }
            });

            if (Object.keys(mergedValues).length) {
              acc[key] = mergedValues;
            }
          } else if (key in settings) {
            acc[key] = settings[key];
          } else {
            acc[key] = validatedSettings[key];
          }
          return acc;
        }, {});
        await knex('notification_settings')
          .where({ user_id: data.id })
          .update({ settings: newSettings, updated_at: new Date() });
      } else {
        await knex('notification_settings').insert({
          user_id: data.id,
          settings: validatedSettings,
          created_at: new Date(),
        });
      }
    }
    if (data.password) {
      if (data.passwordOld) {
        const [passwordHash = null] = await knex('users')
          .where({ id: data.id })
          .pluck('password_hash');
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

      if (groups && (groups & Groups.VOTER) > 0) {
        // changing vote rights
        if (!(userInDB.groups & Groups.VOTER)) {
          // user has no vote rights, but will receive them
          newData.can_vote_since = new Date();
        }
      } else if (userInDB.groups & Groups.VOTER) {
        // user has vote rights, but we will take them
        newData.can_vote_since = null;
      }

      newData.groups = groups;
    }

    // update
    let updatedUserData = null;
    try {
      updatedUserData = await knex.transaction(async trx => {
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

        const [updatedUser: UserProps = null] = await trx
          .where({
            id: data.id,
          })
          .update(newData)
          .into('users')
          .returning('*');
        return updatedUser;
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
    if (!updatedUserData) return null;
    // invalidate cache
    loaders.users.clear(updatedUserData.id);
    // updates session store;
    const updatedUser = updatedUserData ? new User(updatedUserData) : null;
    //
    if (updatedUser) {
      if (viewer.id !== updatedUser.id) {
        if (newData.groups && userInDB) {
          const updatedGroup = getUpdatedGroup(
            userInDB.groups,
            updatedUser.groups,
          );
          EventManager.publish('onUserUpdated', {
            viewer,
            user: {
              ...updatedUser,
              changedField: 'groups',
              changedValue: updatedGroup.value,
              added: updatedGroup.added,
              diff: updatedGroup.names,
            },
            subjectId: updatedUser.id,
          });
        }
      }
    }

    //

    if (viewer.id !== updatedUser.id) {
      if (newData.groups) {
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

    name = sanitizeName(name);

    surname = sanitizeName(surname);
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
      locale: data.locale,
    };
    const newUser = await knex.transaction(async trx => {
      const [userData = null] = await trx
        .insert(newUserData)
        .into('users')
        .returning('*');
      await trx.insert({ user_id: userData.id }).into('notification_settings');
      return userData;
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

  static async delete(viewer, data, loaders) {
    const result = { user: null, errors: [] };
    if (!data || !data.id) {
      result.errors.push('Missing args');
      return result;
    }

    if (!canMutate(viewer, data, Models.USER)) {
      result.errors.push('Permission denied');
      return result;
    }
    let deletedUser;
    try {
      deletedUser = await knex.transaction(async trx => {
        const userInDB = await User.gen(viewer, data.id, loaders);

        if (!userInDB || userInDB.groups !== Groups.GUEST) {
          throw new Error(userInDB ? 'Permission denied' : 'User not found');
        }
        let rowCount;
        try {
          rowCount = await knex('users')
            .transacting(trx)
            .forUpdate()
            .where({ id: data.id })
            .del();
        } catch (e) {
          // FK violation
          if (e.code === '23503') {
            // delete all infos from user
            const now = new Date();
            const newData = {
              id: data.id,
              deleted_at: now,
              updated_at: now,
            };
            if (!data.block) {
              newData.name = ' ';
              newData.surname = ' ';
              newData.email = `unknown@unknown${data.id}.com`;
              newData.groups = 0;
              newData.password_hash = null;
              newData.last_login_at = null;
              newData.can_vote_since = null;
              newData.thumbnail = null;
              newData.email_verified = false;
            }

            // thumbnail
            const deleteUser = async transaction => {
              await knex('users')
                .transacting(transaction)
                .forUpdate()
                .where({ id: data.id })
                .update(newData);
              // userfeeds
              await knex('feeds')
                .transacting(transaction)
                .forUpdate()
                .where({ user_id: data.id })
                .del();
              // useractivities
              // ???

              // usernotifications
              await knex('notifications')
                .transacting(transaction)
                .forUpdate()
                .where({ user_id: data.id })
                .del();
              // notificationsettings
              await knex('notification_settings')
                .transacting(transaction)
                .forUpdate()
                .where({ user_id: data.id })
                .del();
              // subscriptions
              await knex('subscriptions')
                .transacting(transaction)
                .forUpdate()
                .where({ user_id: data.id })
                .del();
              // webpush subscriptions
              await knex('subscriptions')
                .transacting(transaction)
                .forUpdate()
                .where({ user_id: data.id })
                .del();

              // followees
              await knex('user_follows')
                .transacting(transaction)
                .forUpdate()
                .where({ follower_id: data.id })
                .orWhere({ followee_id: data.id })
                .del();

              // requests
              await knex('requests')
                .transacting(transaction)
                .forUpdate()
                .where({ requester_id: data.id })
                .del();
              // wt memberships
              await knex('user_work_teams')
                .transacting(transaction)
                .forUpdate()
                .where({ user_id: data.id })
                .del();
              // messages
              // ???

              // statements likes
              await knex('statement_likes')
                .transacting(transaction)
                .forUpdate()
                .where({ user_id: data.id })
                .del();

              if (!data.block) {
                // statements, comments, delete content
                await knex('statements')
                  .transacting(transaction)
                  .forUpdate()
                  .where({ author_id: data.id })
                  .update({ deleted_at: now, updated_at: now, body: ' ' });
                await knex('comments')
                  .transacting(transaction)
                  .forUpdate()
                  .where({ author_id: data.id })
                  .update({ edited_at: now, updated_at: now, content: ' ' });
              }
            };
            await transactify(deleteUser, knex);
            return userInDB;
          }
          throw e;
        }
        if (rowCount < 1) {
          throw new Error('DB failure');
        }

        return userInDB;
      });
    } catch (err) {
      result.errors.push(err.message ? err.message : err);
      log.error({ err, viewer, data }, 'Deletion failed');
    }

    if (deletedUser) {
      result.user = deletedUser;
    }

    return result;
  }
}

export default User;
