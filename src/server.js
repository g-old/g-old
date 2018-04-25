/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable import/first */
import path from 'path';
import Promise from 'bluebird';
import express from 'express';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
import bodyParser from 'body-parser';
import expressGraphQL from 'express-graphql';
import nodeFetch from 'node-fetch';
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
import chunks from './chunk-manifest.json'; // eslint-disable-line import/no-unresolved
import configureStore from './store/configureStore';
import { setRuntimeVariable } from './actions/runtime';
import { setLocale } from './actions/intl';
import createLoaders from './data/dataLoader';
import User from './data/models/User';
import FileStorage, { AvatarManager } from './core/FileStorage';
import { user as userSchema } from './store/schema';
import config from './config';
import worker from './core/worker';
import BWorker, { sendJob } from './core/childProcess';
import { checkToken } from './core/tokens';
import log from './logger';
import { SubscriptionManager, SubscriptionServer } from './core/sse';
import PubSub from './core/pubsub';
import responseTiming from './core/timing';
import { Groups, Permissions } from './organization';
import EventManager from './core/EventManager';
import root from './compositionRoot';
import { EmailTypes } from './core/BackgroundService';
import Request from './data/models/Request';
/* eslint-enable import/first */

process.on('unhandledRejection', (reason, p) => {
  log.error({ err: { position: p, reason } }, 'Unhandled Rejection');
  if (__DEV__) {
    // send entire app down.
    process.exit(1);
  }
});

const pubsub = new PubSub();

worker(pubsub);
BWorker.start(path.resolve(__dirname, 'backgroundWorker.js'));

const sendMailJob = (viewer, { content }, mailType) => {
  const job = {
    type: 'mail',
    data: {
      lang: content.lang,
      mailType,
      address: content.email,
      viewer,
      connection: {
        host: content.hostname,
        protocol: content.protocol,
      },
    },
  }; // TODO investigate why email has to be overwritten
  if (!sendJob(job)) {
    log.error(
      { viewer, job: { type: 'mail', data: content } },
      'Could not send job to worker',
    );
  }
};

EventManager.subscribe('onProposalCreated', ({ proposal, viewer }) => {
  if (!sendJob({ type: 'webpush', data: proposal })) {
    log.error(
      { viewer, job: { type: 'webpush', data: proposal } },
      'Could not send job to worker',
    );
  }
});

EventManager.subscribe('onStatementCreated', ({ statement, viewer }) => {
  if (
    !sendJob({
      type: 'webpushforstatementsTEST',
      viewer,
      data: statement,
      service: 'subs',
    })
  ) {
    log.error(
      {
        viewer,
        job: { type: 'webpush', data: statement },
      },
      'Could not send job to worker',
    );
  }
});

EventManager.subscribe('sendVerificationMail', ({ request, viewer }) =>
  sendMailJob(viewer, { content: request.content }, EmailTypes.VERIFICATION),
);
EventManager.subscribe('sendWelcomeMail', ({ request, viewer }) =>
  sendMailJob(viewer, { content: request.content }, EmailTypes.WELCOME),
);

const app = express();

// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------

if (config.profiling) {
  app.use(responseTiming());
}
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

// if (__DEV__) {
app.enable('trust proxy');
// }

if (__DEV__) {
  // A route for testing email templates
  app.get('/:email(email|emails)/:template', (req, res) => {
    let message;
    switch (req.params.template) {
      case 'welcome': {
        message = root.MailComposer.getWelcomeMail(
          req.user,
          'a link',
          req.language,
        );

        break;
      }
      case 'resetRequest': {
        message = root.MailComposer.getResetRequestMail(
          req.user,
          'a link',
          req.language,
        );

        break;
      }
      case 'emailVerification': {
        message = root.MailComposer.getEmailVerificationMail(
          req.user,
          'a link',
          req.language,
        );

        break;
      }
      case 'resetNotification': {
        message = root.MailComposer.getResetNotificationMail(
          req.user,
          req.language,
        );

        break;
      }
      case 'message': {
        message = root.MailComposer.getMessageMail(
          req.user,
          { content: 'This is a message' },
          req.user,
          req.language,
        );

        break;
      }
      default: {
        message = { html: '<h1>No template found</h1>' };
      }
    }
    res.send(message.html);
  });
}

app.post(
  '/',
  passport.authenticate('local', {
    successRedirect: '/proposals/active',
  }),
);

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.status(200).json({
    user: req.session.passport.user,
    redirect: '/feed',
  });
});
app.post('/logout', (req, res) => {
  if (req.isAuthenticated()) {
    // TODO save logoutDate as lastLoginDate
    req.logout();
  }
  // Logout from other tab -not sure how handle errors
  res.status(200).json({ loggedOut: true, redirect: '/logged-out' });
});

const recaptchaKeys = {
  secret: config.recaptcha.secret,
  siteKey: config.recaptcha.siteKey,
};
app.post('/signup', (req, res) => {
  // OR post to graphql
  /* res.status(500).json();
  return; */
  const { responseCode, user: userData } = req.body;
  if (!responseCode)
    return res.status(404).json({
      error: 'response-code-missing',
    });
  return nodeFetch(
    'https://www.google.com/recaptcha/api/siteverify' +
      `?secret=${recaptchaKeys.secret}&response=${responseCode}`,
    {
      method: 'POST',
    },
  )
    .then(
      resp => resp.json(),
      err => {
        log.error({ err, req }, 'Recaptcha failed');
        return res.status(404).json({
          error: `Recaptcha authorization failed: Network error `,
        });
      },
    )
    .then(data => {
      if (!data.success) {
        const errors = data['error-codes'] ? data['error-codes'].join(' ') : '';
        return res.status(404).json({
          error: `Recaptcha authorization failed: ${errors}`,
        });
      }
      return null;
    })
    .then(() =>
      User.create({ id: 1, groups: Groups.SYSTEM }, userData)
        .then(user => {
          if (!user) throw Error('User creation failed');
          EventManager.publish('sendWelcomeMail', {
            viewer: user,
            request: {
              content: {
                email: user.email,
                lang: req.cookies.lang,
                host: req.hostname,
                protocol: __DEV__ ? 'http' : 'https',
              },
            },
          });

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
        .catch(error => {
          if (error && error.code === '23505') {
            return res
              .status(200)
              .json({ error: { fields: { email: { unique: false } } } });
          }
          log.error({ err: error, req }, 'Signup failed');
          return res.status(500).json({ error: error.message });
        }),
    );
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
    .then(user => {
      if (!user) {
        throw Error('User update failed');
      }
      // eslint-disable-next-line eqeqeq
      if (req.user.id != user.id) {
        // mod, etc
        return res.json(user);
      }
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-confusing-arrow
        req.login(user, err => (err ? reject(err) : resolve()));
      }).then(() =>
        new Promise((resolve, reject) => {
          // eslint-disable-next-line no-confusing-arrow
          req.session.save(err => (err ? reject(err) : resolve()));
        }).then(() => res.json(req.session.passport.user)),
      );
    })
    .catch(e => res.status(500).json({ message: e.message }));
});

app.post('/forgot', (req, res) => {
  if (req.user) throw Error('User logged in');

  return knex('users')
    .where({ email: req.body.email })
    .select()
    .then(usr => {
      const user = usr[0];
      if (user) {
        const job = {
          type: 'mail',
          data: {
            mailType: EmailTypes.RESET_REQUEST,
            lang: req.cookies.lang,
            address: user.email,
            viewer: user,
            connection: {
              host: req.hostname,
              protocol: req.protocol || 'https' /* getProtocol(req) */,
            },
          },
        };

        if (!sendJob(job)) {
          throw Error('Resetlink mail not sent!');
        }
      }
    })
    .then(() => res.status(200).json({ ok: true }))
    .catch(err => {
      log.error({ err, req }, 'Password reset  failed');
      res.status(200).json({ ok: true });
    });
});
// TODO change to /reset only ?
app.post('/reset/:token', (req, res) =>
  checkToken({ token: req.params.token, table: 'reset_tokens' }) // TODO checkToken and delete it
    .then(data => {
      if (!data) throw Error('Token invalid');
      return User.update(
        { id: 0, groups: Groups.SYSTEM },
        { password: req.body.password, id: data.userId },
        createLoaders(),
      );
    })
    .then(userData => {
      const { user } = userData;
      if (user) {
        if (!user) throw Error('Update failed');
        // TODO separate errorhandling for mail and login

        const job = {
          type: 'mail',
          data: {
            mailType: EmailTypes.RESET_SUCCESS,
            lang: req.cookies.lang,
            address: user.email,
            viewer: user,
            connection: {
              host: req.hostname,
              protocol: req.protocol || 'https' /* getProtocol(req) */,
            },
          },
        };
        if (!sendJob(job)) {
          log.error({ req }, 'Reset success mail not sent!');
        }

        return new Promise((resolve, reject) => {
          // eslint-disable-next-line no-confusing-arrow
          req.login(user, err => (err ? reject(err) : resolve()));
        });
      }
      throw Error('Could not store data');
    })
    .then(() => res.status(200).json({ user: req.user }))
    .catch(error => {
      log.error({ err: error }, 'Password reset failed');
      return res.status(200).json({ user: null, error: error.message });
    }),
);

app.get('/verify/:token', (req, res) => {
  // ! No check if user is logged in !
  const systemViewer = {
    id: 1,
    groups: Groups.SYSTEM,
    permissions: Permissions.VIEW_USER_INFO,
  };
  const loaders = createLoaders();
  checkToken({ token: req.params.token, table: 'verify_tokens' })
    .then(data => {
      if (data) {
        return User.update(
          systemViewer,
          { email: data.email, id: data.userId, emailVerified: true },
          loaders,
        ).then(result => (result ? result.user : null));
      }
      throw Error('Token not valid');
    })
    .then(user => {
      if (user) {
        // delete request
        return knex('requests')
          .where({ type: 'changeEmail' })
          .whereRaw("content->>'email'=?", [user.email])
          .pluck('id')
          .then(([id]) => {
            if (id) {
              return Request.delete(systemViewer, { id }, loaders);
            }
            return null;
          })
          .then(
            () =>
              // update session
              new Promise((resolve, reject) => {
                // eslint-disable-next-line no-confusing-arrow
                req.login(user, err => (err ? reject(err) : resolve()));
              }),
          )
          .then(
            () =>
              new Promise((resolve, reject) => {
                // eslint-disable-next-line no-confusing-arrow
                req.session.save(err => (err ? reject(err) : resolve()));
              }),
          )
          .then(() => res.redirect(`/account`));
        // TODO insert into feed
        // return res.redirect('/account');
      }
      throw Error('User not found');
    })
    .catch(err => {
      log.warn({ err }, 'Email verification failed');
      return res.redirect('/verify');
    });
});

app.post('/verify', (req, res) => {
  let promise;
  if (req.body && req.body.requestId) {
    promise = Request.gen(req.user, req.body.requestId, createLoaders()).then(
      request => {
        if (request) {
          EventManager.publish('sendVerificationMail', {
            viewer: req.user,
            request,
          });
        } else {
          throw new Error('Request not found');
        }
      },
    );
  } else {
    promise = User.gen(req.user, req.user.id, createLoaders()).then(user => {
      if (user) {
        EventManager.publish('sendVerificationMail', {
          viewer: user,
          request: {
            content: {
              email: user.email,
              lang: req.cookies.lang,
              host: req.hostname,
              protocol: __DEV__ ? 'http' : 'https',
            },
          },
        });
      } else {
        throw new Error('Verification mail could not been sent');
      }
    });
  }
  return promise
    .then(() => {
      res.status(200).send();
    })
    .catch(err => {
      log.error({ err }, 'Verification process failed');
      res.status(500).send();
    });
});

const subscriptionManager = new SubscriptionManager({ schema, pubsub });
SubscriptionServer({
  onSubscribe: (msg, params) =>
    Object.assign({}, params, {
      context: {
        loaders: createLoaders(),
        pubsub,
      },
    }),
  subscriptionManager,
  express: app,
  path: '/updates',
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

const graphqlMiddleware = expressGraphQL(req => ({
  schema,
  graphiql: __DEV__,
  rootValue: { request: req },
  pretty: __DEV__,
  context: {
    viewer: req.user,
    loaders: createLoaders(),
    pubsub,
  },
}));

app.use('/graphql', graphqlMiddleware);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const css = new Set();

    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    const insertCss = (...styles) => {
      // eslint-disable-next-line no-underscore-dangle
      styles.forEach(style => css.add(style._getCss()));
    };

    // Universal HTTP client
    const fetch = createFetch(nodeFetch, {
      baseUrl: config.api.serverUrl,
      cookie: req.headers.cookie,
    });

    let normalizedData = { entities: {}, result: null };
    let recaptchaKey;
    if (req.user) {
      normalizedData = normalize(req.user, userSchema);
    } else {
      recaptchaKey = recaptchaKeys.siteKey;
    }
    let cookieConsent;
    if (req.cookies) {
      cookieConsent = req.cookies.consent || null;
    }
    const initialState = {
      user: normalizedData.result || null,
      entities: {
        users: {
          byId: normalizedData.entities.users || {},
        },
        roles: normalizedData.entities.roles || {},
      },
      consent: cookieConsent,
      system: {
        webPushKey: config.webpush.publicKey,
        recaptchaKey, // will be null if user is logged in
        droneBranch: process.env.DRONE_BRANCH || (__DEV__ ? 'dev' : null), // branch or tag
        droneBuild: process.env.DRONE_BUILD_NUMBER || (__DEV__ ? 'dev' : null),
      },
    };
    const store = configureStore(initialState, {
      // cookie: req.headers.cookie,
      fetch,
      history: null,
    });

    store.dispatch(
      setRuntimeVariable({
        name: 'initialNow',
        value: Date.now(),
      }),
    );

    store.dispatch(
      setRuntimeVariable({
        name: 'availableLocales',
        value: config.locales,
      }),
    );

    const locale = req.language;
    const intl = await store.dispatch(
      setLocale({
        locale,
      }),
    );

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      insertCss,
      fetch,
      // You can access redux through react-redux connect
      store,
      pathname: req.path,
      query: req.query,
      intl,
      locale,
    };

    const route = await router.resolve(context);
    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const data = { ...route };
    data.children = ReactDOM.renderToString(
      <App context={context} /* store={store} */>{route.component}</App>,
    );
    data.styles = [{ id: 'css', cssText: [...css].join('') }];

    const scripts = new Set();
    const addChunk = chunk => {
      if (chunks[chunk]) {
        chunks[chunk].forEach(asset => scripts.add(asset));
      } else if (__DEV__) {
        throw new Error(`Chunk with name '${chunk}' cannot be found`);
      }
    };
    addChunk('client');
    if (route.chunk) addChunk(route.chunk);
    if (route.chunks) route.chunks.forEach(addChunk);

    data.scripts = Array.from(scripts);

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
if (!module.hot) {
  app.listen(config.port, () => {
    console.info(`The server is running at http://localhost:${config.port}/`);
  });
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;
