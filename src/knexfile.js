// Update with your config settings.
const config = require('../private_configs');

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: config.development.database,
      user: config.development.user,
      password: config.development.password,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './data/db/migrations',
    },
    seeds: {
      directory: './data/db/seeds',
    },
    debug: true,
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
    ssl: true,
  },

};
