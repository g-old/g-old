if (process.env.BROWSER) {
  // prettier-ignore
  throw new Error(
    'Do not import `knex.js` from inside the client-side code.'
  );
}
const env = process.env.NODE_ENV || 'development';
const config = require('../knexfile')[env];

module.exports = require('knex')(config);
