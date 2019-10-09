// Update with your config settings.
const config = require('./config');

module.exports = {
  development: {
    client: 'pg',
    connection: config.dbConfig,
    pool: {
      min: 2,
      max: 30,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './data/db/migrations',
    },
    seeds: {
      directory: './data/db/seeds/dev',
    },
    debug: true,
  },
  production: {
    client: 'pg',
    connection: config.dbConfig, // process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 30,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds/production',
    },
    ssl: true,
  },
  test: {
    client: 'pg',
    connection: config.test.dbConfig,
    migrations: {
      tableName: 'knex_migrations',
      directory: './data/db/migrations',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
