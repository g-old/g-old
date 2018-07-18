/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/**
 * Passport.js reference implementation.
 * The database schema used in this sample is available at
 * https://github.com/membership/membership.db/tree/master/postgres
 */

import passport from 'passport';
import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import knex from './data/knex';
import log from './logger';
import { calcRights } from './organization';

function verifyUser(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (emailField, password, done) => {
      if (typeof emailField !== 'string' || emailField.length > 254) {
        done(null, false);
      }
      const email = emailField.trim().toLowerCase();
      return knex('users')
        .where({ email })
        .whereNull('deleted_at')
        .returning([
          'id',
          'name',
          'password_hash',
          'surname',
          'email',
          'thumbnail',
          'groups',
          'can_vote_since',
          'email_verified',
        ])
        .update({ last_login_at: new Date() })
        .then(userData => {
          const user = userData[0];
          if (!user) {
            return done(null, false);
          }
          return verifyUser(user, password).then(verified => {
            if (verified) {
              log.info({ user }, 'User logged in');
              return done(null, user);
            }
            log.warn({ user }, 'User verification failed');
            return done(null, false);
          });
        })
        .catch(error => {
          log.error({ err: error }, 'User log in failed');
          return done(error);
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  try {
    const emailVerified =
      'emailVerified' in user ? user.emailVerified : user.email_verified;
    const rights = calcRights(user.groups);
    let avatar = user.thumbnail || '';
    const stIndex = avatar.indexOf('c_scale');
    if (stIndex > 0) {
      // has thumbnailUrl
      const endIndex = stIndex + 18; // (!)
      avatar = avatar.slice(0, stIndex) + avatar.substring(endIndex);
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      avatar,
      thumbnail: user.thumbnail,
      permissions: rights.perm,
      privileges: rights.priv,
      groups: user.groups,
      emailVerified,
    };
    done(null, sessionUser);
    return null;
  } catch (error) {
    log.error({ user }, 'Serializing failed');
    done({ message: 'Serializing failed', name: 'SerializeError' });
    return null;
  }
});

passport.deserializeUser((sessionUser, done) => {
  done(null, sessionUser);
});

export default passport;
