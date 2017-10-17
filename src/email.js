import config from '../private_configs';

const env = process.env.NODE_ENV || 'development';

// eslint-disable-next-line import/no-mutable-exports
let Mailer = {
  send: () => {
    throw Error('Not implemented');
  },
};

const USE_SENDGRID = process.env.NODE_ENV === 'test';

if (env === 'development') {
  const nodeMailer = require('nodemailer'); // eslint-disable-line global-require
  const mailOptions = config[env].mailer;
  const Transporter = nodeMailer.createTransport(mailOptions.config);
  Mailer.send = mail =>
    new Promise((resolve, reject) => {
      Transporter.sendMail(mail, (err, data) => {
        Transporter.close();
        if (err) reject(err);
        resolve(data);
      });
    }).then(info => {
      console.info(info);
      return info.message;
    });
}
if (env === 'production' || USE_SENDGRID) {
  const sendGrid = require('@sendgrid/mail'); // eslint-disable-line global-require

  sendGrid.setApiKey(
    process.env.SENDGRID_API_KEY || config.production.SENDGRID_API_KEY,
  );
  Mailer = sendGrid;
}

export default Mailer;
