/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
import bodyParser from 'body-parser';
import expressGraphQL from 'express-graphql';
import React from 'react';
import ReactDOM from 'react-dom/server';
import UniversalRouter from 'universal-router';
import PrettyError from 'pretty-error';
import session from 'express-session';
import knexSession from 'connect-session-knex';
import { IntlProvider } from 'react-intl';
import multer from 'multer';
import knex from './data/knex';
import './serverIntlPolyfill';
import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import schema from './data/schema';
import routes from './routes';
import assets from './assets.json'; // eslint-disable-line import/no-unresolved
import configureStore from './store/configureStore';
import { setRuntimeVariable } from './actions/runtime';
import { setLocale } from './actions/intl';
import { port, locales } from './config';
import createLoaders from './data/dataLoader';
import passport from './core/passport';
import User from './data/models/User';
import FileStorage, { AvatarManager } from './core/FileStorage';
import PasswordReset from './data/models/PasswordReset';
import { sendMail, resetLinkMail, resetSuccessMail } from './core/mailer';

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
    languages: locales,
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
  //cookie: { secure: true } // Use with SSL : https://github.com/expressjs/session
};

const SessionStore = knexSession(session);
const sessionDB = new SessionStore({
  knex,
});
sessionConfig.store = sessionDB;

app.use(session(sessionConfig));

//
// Authentication
// -----------------------------------------------------------------------------
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV !== 'production') {
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
    .then(user => {
      if (!user) throw Error('User creation failed');
      req.login(user, error => {
        if (!error) {
          res.status(200).json({ user: req.session.passport.user });
        } else {
          res.status(500).json({ error: true });
        }
      });
    })
    .catch(error => {
      if (error.code === '23505') {
        res.status(500).json({ error: { detail: 'email' } });
      }
      res.status(500).json({ error: true });
    });
});
const storage = multer.memoryStorage();
const FileStore = FileStorage(AvatarManager);
app.post('/upload', multer({ storage }).single('avatar'), (req, res) => {
  if (!req.user) res.status(505);
  FileStore.save({ viewer: req.user, data: req.body.avatar, loaders: createLoaders() }, 'avatars/')
    // eslint-disable-next-line no-confusing-arrow
    // TODO update session
    // .then(user => user ? res.status(200).json(user) : res.status(500))
    .then(user => {
      if (!user) {
        throw Error('User update failed');
      }
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-confusing-arrow
        req.login(user, err => err ? reject(err) : resolve(user));
      });
    })
    .then(user => res.status(200).json(user))
    .catch(() => res.status(500));
});

app.post(
  '/forgot',
  (req, res) =>
    PasswordReset.createToken(req.body.email)
      .then(token => {
        if (!token) throw Error('Token not generated');
        return sendMail(resetLinkMail(req.body.email.email, req.headers.host, token));
      })
      .then(info => {
        // TODO ONLY for TESTING!
        console.log(info.envelope);
        console.log(info.messageId);
        console.log(info.message);
        res.status(200).json({ ok: true });
      })
      .catch(error => {
        console.log('ERROR: ', error);
        res.status(200).json({ ok: true });
      }), // give no feedback!
);
// TODO change to /reset only ?
app.post('/reset/:token', (req, res) => {
  PasswordReset.checkToken({ token: req.params.token }) // TODO checkToken and delete it
    .then(data => {
      if (!data) throw Error('Token invalid');
      return User.update(
        { id: 0, role: 'system' },
        { password: req.body.password, id: data.userId },
        createLoaders(),
      );
    })
    .then(user => {
      if (!user) throw Error('Update failed');
      // TODO separate errorhandling for mail and login
      return Promise.all([
        sendMail(resetSuccessMail(user.email)).then(
          info => {
            // TODO ONLY for TESTING!
            console.log(info.envelope);
            console.log(info.messageId);
            console.log(info.message);
          },
          err => console.log('MAILING failed', err),
        ),
        new Promise((resolve, reject) => {
          // eslint-disable-next-line no-confusing-arrow
          req.login(user, err => err ? reject(err) : resolve());
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
    .then(data => {
      res.status(200).json(data);
    })
    .catch(error => next(error));
});

//
// Register API middleware
// -----------------------------------------------------------------------------
// const storage = multer.memoryStorage(); // risk of runnig out of memory
// app.use('/graphql', multer({ storage }).single('file')); // or switch to own route ? Performance
app.use(
  '/graphql',
  expressGraphQL(req => ({
    schema,
    graphiql: process.env.NODE_ENV !== 'production',
    rootValue: { request: req },
    pretty: process.env.NODE_ENV !== 'production',
    context: {
      viewer: req.user,
      loaders: createLoaders(),
    },
  })),
);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const store = configureStore(
      {
        user: req.user || {}, // changed from null
      },
      {
        cookie: req.headers.cookie,
      },
    );

    store.dispatch(
      setRuntimeVariable({
        name: 'initialNow',
        value: Date.now(),
      }),
    );

    store.dispatch(
      setRuntimeVariable({
        name: 'availableLocales',
        value: locales,
      }),
    );

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
      // Initialize a new Redux store
      // http://redux.js.org/docs/basics/UsageWithReact.html
      store,
    };

    const route = await UniversalRouter.resolve(routes, {
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
    data.children = ReactDOM.renderToString(<App context={context}>{route.component}</App>);
    data.style = [...css].join('');
    data.scripts = [assets.vendor.js, assets.client.js];
    if (assets[route.chunk]) {
      data.scripts.push(assets[route.chunk].js);
    }
    data.state = context.store.getState();
    data.lang = locale;

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
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      style={errorPageStyle._getCss()} // eslint-disable-line no-underscore-dangle
      lang={locale}
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

app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}/`);
});

/* eslint-enable no-console */
