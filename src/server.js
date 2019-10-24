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
import rateLimit from 'express-rate-limit';
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
import responseTiming from './core/timing';
import { Groups } from './organization';
import EventManager from './core/EventManager';
import root from './compositionRoot';
import { EmailType } from './core/BackgroundService';
import Request from './data/models/Request';
import ImageManager from './FileManager';
import BotLoader from './bot';

/* eslint-enable import/first */
const PRIVATE_FILE_FOLDER = 'private_files';

process.on('unhandledRejection', (reason, p) => {
  log.error({ err: { position: p, reason } }, 'Unhandled Rejection');
  if (__DEV__) {
    console.error('ERROR', reason, p);
    // send entire app down.
    process.exit(1);
  }
});

const pubsub = root.PubSub;
root.NotificationService.start();

worker();
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

/* EventManager.subscribe('onProposalCreated', ({ proposal, viewer }) => {
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
}); */

EventManager.subscribe('sendVerificationMail', ({ request, viewer }) =>
  sendMailJob(viewer, { content: request.content }, EmailType.VERIFICATION),
);
EventManager.subscribe('sendWelcomeMail', ({ request, viewer }) =>
  sendMailJob(viewer, { content: request.content }, EmailType.WELCOME),
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
if (__DEV__) {
  app.use(express.static(path.join(__dirname, '/avatars')));
}
app.use(express.static(path.join(__dirname, '/images')));

app.use(cookieParser()); // needed by requestLanguage
app.use(
  /* allowed as technical cookie, if not used for profiling - see also
   https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/3167654 1a */
  requestLanguage({
    languages: config.locales,
    queryName: 'lang',
    cookie: {
      name: 'lang',
      options: {
        path: '/',
        maxAge: 365 * 24 * 3600 * 1000, // 1 year in miliseconds
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

let sessionSecret;
if (!__DEV__) {
  sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('cookie-secret-undefined');
  }
} else {
  sessionSecret = 'keyboard cat';
}
const sessionConfig = {
  secret: sessionSecret,
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
// ratelimiting
if (!__DEV__) {
  const uploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8 });
  app.use('/upload/', uploadLimiter);
}
// if (__DEV__) {
app.enable('trust proxy');
// }

if (__DEV__) {
  // A route for testing email templates
  app.get('/:email(email|emails)/:template', (req, res) => {
    let message;
    const loremIpsum = `
            Id eligendi esse error officia iure esse rerum qui eius.
            Quo mollitia ut ut dolores quia odio et beatae perspiciatis.
            Corporis et mollitia molestiae doloribus inventore laudantium quia.
            Maxime et sunt ipsa maxime autem.
            Voluptatibus est deleniti et eum.
            In at fuga et odio. Aut quod odit voluptatibus molestiae voluptatem et quia.
            Dolorum natus deleniti fugiat ut accusamus.
`;
    const actor = {
      fullName: `${req.user.name} ${req.user.surname}`,
      thumbnail: req.user.thumbnail,
    };
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

      case 'proposalNotification': {
        message = root.MailComposer.getProposalMail({
          proposal: {
            body: loremIpsum,
            title: 'Title of the proposal',
          },
          locale: req.language,
          sender: actor,
        });
        break;
      }

      case 'statementNotification': {
        message = root.MailComposer.getStatementMail({
          statement: {
            body: loremIpsum,
            position: 'pro',
          },
          subject: 'The subject',
          notification: 'has written a statement!',
          link: '/',
          author: actor,
          proposalTitle: 'Title of the proposal',
          locale: req.language,
        });
        break;
      }
      case 'commentNotification': {
        message = root.MailComposer.getCommentMail({
          author: actor,
          comment: {
            content: loremIpsum,
          },
          discussionTitle: 'Title of the discussion',
          locale: req.language,
        });
        break;
      }

      case 'messageNotification': {
        message = root.MailComposer.getMessageMail({
          sender: actor,
          message: `${loremIpsum}<br> <strong> Okay  </strong></br>`,
          notification: 'hat ihnen eine Nachricht geschrieben',
          link: '/',
          title: 'The subject',
          locale: req.language,
        });
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

app.post('/login', passport.authenticate('local'), async (req, res) => {
  const [count] = await knex('notifications')
    .where({ user_id: req.user.id, read: false })
    .count('id');
  res.status(200).json({
    user: { ...req.session.passport.user, unreadNotifications: count.count },
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
      BotLoader.getBot().then(bot =>
        User.create(bot, { ...userData, locale: req.language })
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
      ),
    );
});
const storage = multer.memoryStorage();
const FileStore = FileStorage(AvatarManager({ local: !!__DEV__ }));

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ensureAuthenicated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.post(
  '/upload/files',
  ensureAuthenicated,
  multer({ storage, limits: { fieldSize: MAX_FILE_SIZE } }).array('files', 10),
  async (req, res) => {
    try {
      if (!req.user || !req.user.emailVerified) {
        return res.sendStatus(401);
      }
      const params = JSON.parse(req.body.params || {});
      if (params.private) {
        if (params.verification) {
          const result = await ImageManager.storePrivateImages({
            viewer: req.user,
            data: { images: req.body.files, params },
            loaders: createLoaders(),
          });

          if (!result || !result.result) {
            return res.json({
              error: (result && result.error) || 'File saving failed',
            });
          }

          return res.json({ result: result.result });
        }
      }
      // user must be of group user(?)
      // it seems, that binary files are stored in req.files, but base64-strings in req.body
      const result = await ImageManager.storeImages({
        viewer: req.user,
        data: { images: req.files, params },
        loaders: createLoaders(),
      });
      return res.json(result);
    } catch (err) {
      return res.json({ error: err });
    }
  },
);
// For protected resources
app.get('/files/:fileName', ensureAuthenicated, (req, res) => {
  // eslint-disable-next-line no-bitwise
  if (req.user.groups & Groups.MEMBER_MANAGER) {
    const { fileName } = req.params;
    // Maybe not necessary, don't know how much protection path.resolve and sendFile offer

    if (fileName.length && fileName.length < 50 && fileName.length > 5) {
      const [name, extension] = fileName.split('.');
      if (extension === 'jpg') {
        // from https://github.com/parshap/node-sanitize-filename/blob/master/index.js
        // eslint-disable-next-line no-useless-escape
        const illegalRe = /[\/\?<>\\:\*\|"]/g;
        // eslint-disable-next-line no-control-regex
        const controlRe = /[\x00-\x1f\x80-\x9f]/g;
        const reservedRe = /^\.+$/;

        if (![illegalRe, controlRe, reservedRe].some(re => name.match(re))) {
          return res.sendFile(
            path.resolve(
              __dirname,
              `${PRIVATE_FILE_FOLDER}/${req.params.fileName}`,
            ),
          );
        }
      }
    }
    return res.sendStatus(400);
  }
  return res.sendStatus(403);
});

app.post('/upload', multer({ storage }).single('avatar'), (req, res) => {
  // we have to take care not everyone can flood our webspace
  if (!req.user || !req.user.emailVerified) {
    return res.sendStatus(401);
  }
  return (
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
      .catch(e => res.status(500).json({ message: e.message }))
  );
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
            mailType: EmailType.RESET_REQUEST,
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
      return BotLoader.getBot().then(bot =>
        User.update(
          bot,
          { password: req.body.password, id: data.userId },
          createLoaders(),
        ),
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
            mailType: EmailType.RESET_SUCCESS,
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

app.get('/verify/:token', async (req, res) => {
  // ! No check if user is logged in !
  /* const systemViewer = {
    id: -1,
    groups: Groups.SYSTEM,
    permissions: Permissions.VIEW_USER_INFO,
  }; */

  const loaders = createLoaders();
  const bot = await BotLoader.getBot();

  return checkToken({ token: req.params.token, table: 'verify_tokens' })
    .then(data => {
      if (data) {
        return User.update(
          bot,
          {
            email: data.email,
            id: data.userId,
            emailVerified: true,
            groups: Groups.VIEWER,
          },
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
              return Request.delete(bot, { id }, loaders);
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
  onSubscribe: (msg, params) => ({
    ...params,
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
      const [count] = await knex('notifications')
        .where({ user_id: req.user.id, read: false })
        .count('id');
      normalizedData = normalize(
        { ...req.user, unreadNotifications: count.count },
        userSchema,
      );
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
