// Update with your config settings.
const config = require('../private_configs');

module.exports = {
  development: {
    client: 'postgresql',
    connection: config.development.dbConfig,
    pool: {
      min: 2,
      max: 10,
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
    client: 'postgresql',
    connection: config.production.dbConfig, // process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
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
    client: 'postgresql',
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
