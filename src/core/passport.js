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
import knex from '../data/knex';

function verifyUser(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (email, password, done) =>
      knex('users')
        .where({ email })
        .first()
        .then((user) => {
          if (!user) {
            return done(null, false);
          }
          return verifyUser(user, password).then((verified) => {
            if (verified) {
              return done(null, user);
            }
            return done(null, false);
          });
        })
        .catch(error => done(error)),
  ),
);

passport.serializeUser((user, done) =>
  knex('roles')
    .where({ id: user.role_id })
    .select('id', 'type')
    .then((data) => {
      if (data) {
        const role = data[0]; // .type;
        const sessionUser = {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          avatar: user.avatar_path || user.avatar, // TODO change!
          privilege: user.privilege,
          role: {
            id: role.id,
            type: role.type,
          },
        };
        done(null, sessionUser);
      }
      return Error('Role not found');
    })
    .catch(error => done(error)),
);

passport.deserializeUser((sessionUser, done) => {
  done(null, sessionUser);
});

export default passport;
