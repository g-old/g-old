/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import Promise from 'bluebird';
import express from 'express';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
import bodyParser from 'body-parser';
import expressGraphQL from 'express-graphql';
import React from 'react';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import session from 'express-session';
import knexSession from 'connect-session-knex';
import { IntlProvider } from 'react-intl';
import multer from 'multer';
import { normalize } from 'normalizr';
import knex from './data/knex';
import './serverIntlPolyfill';
import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import createFetch from './createFetch';
import passport from './passport';
import router from './router';
import schema from './data/schema';
import assets from './assets.json'; // eslint-disable-line import/no-unresolved
import configureStore from './store/configureStore';
import { setRuntimeVariable } from './actions/runtime';
import { setLocale } from './actions/intl';
import createLoaders from './data/dataLoader';
import User from './data/models/User';
import FileStorage, { AvatarManager } from './core/FileStorage';
import PasswordReset from './data/models/PasswordReset';
import { sendMail, resetLinkMail, resetSuccessMail } from './core/mailer';
import { user as userSchema } from './store/schema';
import config from './config';

import worker from './core/worker';

worker();
const app = express();

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/avatars')));
app.use(cookieParser());
app.use(
  requestLanguage({
    languages: config.locales,
    queryName: 'lang',
    cookie: {
      name: 'lang',
      options: {
        path: '/',
        maxAge: 3650 * 24 * 3600 * 1000, // 10 years in miliseconds
      },
      url: '/lang/{language}',
    },
  }),
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//
// Sessions
// -----------------------------------------------------------------------------

const sessionConfig = {
  secret: 'keyboard cat', // TODO change
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 4 * 60 * 60 * 1000 },
  // cookie: { secure: true } // Use with SSL : https://github.com/expressjs/session
};

const SessionStore = knexSession(session);
const sessionDB = new SessionStore({
  knex,
});
sessionConfig.store = sessionDB;

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

if (__DEV__) {
  app.enable('trust proxy');
}

app.post(
  '/',
  passport.authenticate('local', {
    successRedirect: '/proposals/active',
  }),
);

app.post('/logout', (req, res) => {
  if (req.isAuthenticated()) {
    req.logout();
  }
  // Logout from other tab -not sure how handle errors
  res.status(200).json({ loggedOut: true, redirect: '/logged-out' });
});

app.post('/signup', (req, res) => {
  // OR post to graphql
  User.create(req.body.user)
    .then((user) => {
      if (!user) throw Error('User creation failed');
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-confusing-arrow
        req.login(user, err => (err ? reject(err) : resolve()));
      });
    })
    .then(
      () =>
        new Promise((resolve, reject) => {
          // eslint-disable-next-line no-confusing-arrow
          req.session.save(err => (err ? reject(err) : resolve()));
        }),
    )
    .then(() => res.status(200).json({ user: req.session.passport.user }))
    .catch((error) => {
      if (error.code === '23505') {
        res.status(500).json({ error: { fields: { email: 'Email not unique' } } });
      }
      res.status(500).json({ error: {} });
    });
});
const storage = multer.memoryStorage();
const FileStore = FileStorage(AvatarManager({ local: !!__DEV__ }));

app.post('/upload', multer({ storage }).single('avatar'), (req, res) => {
  if (!req.user) res.status(505);
  FileStore.save(
    {
      viewer: req.user,
      data: { dataUrl: req.body.avatar, id: req.body.id },
      loaders: createLoaders(),
    },
    'avatars/',
  ) // eslint-disable-next-line no-confusing-arrow
    // TODO update session
    // .then(user => user ? res.status(200).json(user) : res.status(500))
    .then((user) => {
      if (!user) {
        throw Error('User update failed');
      }
      if (req.body.id && req.body.id !== req.user.id) {
        // eslint-disable-next-line no-throw-literal
        throw { id: req.body.id, user };
      }
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-confusing-arrow
        req.login(user, err => (err ? reject(err) : resolve(user)));
      });
    })
    .then(
      () =>
        new Promise((resolve, reject) => {
          // eslint-disable-next-line no-confusing-arrow
          req.session.save(err => (err ? reject(err) : resolve()));
        }),
    )
    .then(() => res.json(req.session.passport.user))
    .catch(
      // TODO rewrite hole function
      // eslint-disable-next-line no-confusing-arrow
      e =>
        e.id === req.body.id
          ? res.json(new User(e.user))
          : res.status(500).json({ message: e.message }),
    );
});

app.post(
  '/forgot',
  (req, res) =>
    PasswordReset.createToken(req.body.email)
      .then((token) => {
        if (!token) throw Error('Token not generated');
        return sendMail(resetLinkMail(req.body.email.email, req.headers.host, token));
      })
      .then((info) => {
        // TODO ONLY for TESTING!
        console.info(info.envelope);
        console.info(info.messageId);
        console.info(info.message);
        res.status(200).json({ ok: true });
      })
      .catch((error) => {
        console.error('ERROR: ', error);
        res.status(200).json({ ok: true });
      }), // give no feedback!
);
// TODO change to /reset only ?
app.post('/reset/:token', (req, res) => {
  PasswordReset.checkToken({ token: req.params.token }) // TODO checkToken and delete it
    .then((data) => {
      if (!data) throw Error('Token invalid');
      return User.update(
        { id: 0, role: { type: 'system' } },
        { password: req.body.password, id: data.userId },
        createLoaders(),
      );
    })
    .then((user) => {
      if (!user) throw Error('Update failed');
      // TODO separate errorhandling for mail and login
      return Promise.all([
        sendMail(resetSuccessMail(user.email)).then(
          (info) => {
            // TODO ONLY for TESTING!
            console.info(info.envelope);
            console.info(info.messageId);
            console.info(info.message);
          },
          err => console.error('MAILING failed', err),
        ),
        new Promise((resolve, reject) => {
          // eslint-disable-next-line no-confusing-arrow
          req.login(user, err => (err ? reject(err) : resolve()));
        }),
      ]);
    })
    .then(() => res.status(200).json({ user: req.user }))
    .catch(error => res.status(500).json({ error }));
});

app.get('/test', (req, res, next) => {
  knex('users')
    .where({ name: 'admin' })
    .join('roles', 'users.role_id', '=', 'roles.id')
    .select('type')
    .then((data) => {
      res.status(200).json(data);
    })
    .catch(error => next(error));
});

//
// Register API middleware
// -----------------------------------------------------------------------------
// const storage = multer.memoryStorage(); // risk of runnig out of memory
// app.use('/graphql', multer({ storage }).single('file')); // or switch to own route ? Performance

const graphqlMiddleware = expressGraphQL(req => ({
  schema,
  graphiql: __DEV__,
  rootValue: { request: req },
  pretty: __DEV__,
  context: {
    viewer: req.user,
    loaders: createLoaders(),
  },
}));

app.use('/graphql', graphqlMiddleware);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    let normalizedData = { entities: {}, result: null };
    if (req.user) {
      normalizedData = normalize(req.user, userSchema);
    }
    const initialState = {
      user: normalizedData.result || null,
      entities: {
        users: {
          byId: normalizedData.entities.users || {},
        },
        roles: normalizedData.entities.roles || {},
      },
    };
    const fetch = createFetch({
      baseUrl: config.api.serverUrl,
      cookie: req.headers.cookie,
    });
    const store = configureStore(
      initialState, {
        fetch,
        history: null,
      },
    );


    store.dispatch(
      setRuntimeVariable({
        name: 'initialNow',
        value: Date.now(),
      }),
    );

    store.dispatch(setRuntimeVariable({
      name: 'availableLocales',
      value: config.locales,
    }));

    const locale = req.language;
    await store.dispatch(
      setLocale({
        locale,
      }),
    );

    const css = new Set();

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss: (...styles) => {
        // eslint-disable-next-line no-underscore-dangle
        styles.forEach(style => css.add(style._getCss()));
      },
      fetch,
      // You can access redux through react-redux connect
      store,
    };

    const route = await router.resolve({
      ...context,
      path: req.path,
      query: req.query,
      locale,
    });
    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const data = { ...route };

    const rootComponent = (
      <App context={context} store={store}>
        {route.component}
      </App>
    );

    data.children = await ReactDOM.renderToString(rootComponent);
    data.styles = [{ id: 'css', cssText: [...css].join('') }];
    data.scripts = [assets.vendor.js, assets.client.js];

    if (assets[route.chunk]) {
      data.scripts.push(assets[route.chunk].js);
    }

    // Furthermore invoked actions will be ignored, client will not receive them!
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.info('Serializing store...');
    }
    data.app = {
      apiUrl: config.api.clientUrl,
      state: context.store.getState(),
      lang: locale,
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.log(pe.render(err)); // eslint-disable-line no-console
  const locale = req.language;
  console.error(pe.render(err));
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
      app={{ lang: locale }}
    >
      {ReactDOM.renderToString(
        <IntlProvider locale={locale}>
          <ErrorPageWithoutStyle error={err} />
        </IntlProvider>,
      )}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

app.listen(config.port, () => {
  console.log(`The server is running at http://localhost:${config.port}/`);
});
