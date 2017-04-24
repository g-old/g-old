module.exports = {
  development: {
    database: 'database_name',
    user: 'user',
    password: 'password',
    mailer: {
      config: {
        jsonTransport: true, // stream output to console
      },
      sender: '{email address}',
    },
  },
  production: {
    database: 'database_name',
    user: 'user',
    password: 'password',
    mailer: {
      config: {
        // https://nodemailer.com/smtp/
        // gmail example, no pooling used!
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: '{local-part}@gmail.com',
          pass: 'password',
        },
        sender: '{email address}',
      },
    },
  },
  deploy: {
    url: 'https://git.heroku.com/{name}.git',
    website: 'https://{name}.herokuapp.com/',
  },
};
