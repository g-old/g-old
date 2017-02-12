exports.module = {
  development: {
    database: 'database_name',
    user: 'user',
    password: 'password',
  },
  production: {
    database: 'database_name',
    user: 'user',
    password: 'password',
  },
  deploy: {
    url: 'https://git.heroku.com/{name}.git',
    website: 'https://{name}.herokuapp.com/',
  },
};
