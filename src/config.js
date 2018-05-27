/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

if (process.env.BROWSER) {
  throw new Error(
    'Do not import `config.js` from inside the client-side code.',
  );
}

/* first of all, read in the .env file */
require('dotenv-extended').config({ path: process.env.DOTENV || '.env' });

module.exports = {
  // default locale is the first one
  locales: ['de-DE', 'it-IT', 'lld-IT'],

  // Node.js app
  port: process.env.PORT,

  profiling: true,

  // API Gateway
  api: {
    // API URL to be used in the client-side code
    clientUrl: process.env.API_CLIENT_URL || '',
    // API URL to be used in the server-side code
    serverUrl:
      process.env.API_SERVER_URL || `http://localhost:${process.env.PORT}`,
  },

  dbConfig: process.env.DATABASE_URL,
  mailer: {
    config: {
      jsonTransport: process.env.MAILER_JSONTRANSPORT === 'true', // stream output to console
      // https://nodemailer.com/smtp/
      // gmail example, no pooling used!
      host: process.env.MAILER_HOST,
      port: process.env.MAILER_PORT,
      secure: process.env.MAILER_SECURE === 'true',
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
      },
      service: process.env.MAILER_SERVICE,
      ignoreTls: process.env.MAILER_IGNORE_TLS === 'true',
    },
    sender: process.env.MAILER_SENDER,
  },
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  recaptcha: {
    secret: process.env.RECAPTCHA_SECRET,
    siteKey: process.env.RECAPTCHA_KEY,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_secret: process.env.CLOUDINARY_SECRET,
    api_key: process.env.CLOUDINARY_KEY,
  },
  // in gold folder open node REPL, type: var wp = require('web-push');wp.generateVAPIDKeys()
  webpush: {
    mail: process.env.WEBPUSH_MAIL,
    publicKey: process.env.WEBPUSH_PUBKEY,
    privateKey: process.env.WEBPUSH_PRIVKEY,
  },

  /** test-configuration, we might be able to move this to a .test.env and source it before the default .env file */
  test: {
    dbConfig: process.env.TEST_DATABASE_URL,
    mailer: {
      config: {
        jsonTransport: process.env.TEST_MAILER_JSONTRANSPORT, // stream output to console
        // https://nodemailer.com/smtp/
        // gmail example, no pooling used!
        host: process.env.TEST_MAILER_HOST,
        port: process.env.TEST_MAILER_PORT,
        secure: process.env.TEST_MAILER_SECURE, // upgrade later with STARTTLS
        auth: {
          user: process.env.TEST_MAILER_USER,
          pass: process.env.TEST_MAILER_PASSWORD,
        },
      },
      sender: process.env.TEST_MAILER_SENDER,
    },
  },
};
