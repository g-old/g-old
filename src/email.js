import config from './config';

// eslint-disable-next-line import/no-mutable-exports
let Mailer = {
  send: () => {
    throw Error('Not implemented');
  },
};

if (process.env.NODE_ENV === 'development') {
  const nodeMailer = require('nodemailer'); // eslint-disable-line global-require
  const mailOptions = config.mailer;
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
} else {
  const sendGrid = require('@sendgrid/mail'); // eslint-disable-line global-require

  sendGrid.setApiKey(config.SENDGRID_API_KEY);
  Mailer = sendGrid;
}

export default Mailer;
