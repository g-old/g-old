import nodemailer from 'nodemailer';

const config = require('../../private_configs');

const env = process.env.NODE_ENV || 'development';
const mailOptions = config[env].mailer;
const Transporter = nodemailer.createTransport(mailOptions.config);

export const resetLinkMail = (email, host, token) => {
  if (!email || !host || !token) throw Error('Mail details not provided');
  // TODO further checks
  // TODO Lang option
  return {
    from: mailOptions.sender || 'passwordreset@g-old.com',
    to: email,
    subject: 'G-old Password Reset',
    text:
      `${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click on the following link, or paste this into your browser to complete the process:\n\nhttp://'}${host}/reset/${token}\n\n` +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n',
  };
};
export const sendMail = mail =>
  new Promise((resolve, reject) => {
    Transporter.sendMail(mail, (err, data) => {
      Transporter.close();
      if (err) reject(err);
      resolve(data);
    });
  });
export const resetSuccessMail = (email) => {
  if (!email) throw Error('Mail details not provided');
  return {
    from: mailOptions.sender || 'passwordreset@g-old.com',
    to: email,
    subject: 'Your password has been changed',
    text: `${'Hello,\n\n This is a confirmation that the password for your account '}${email} has just been changed.\n`,
  };
};

export const emailVerificationMail = (email, connection, token, name) => {
  if (!email || !connection || !connection.host || !connection.protocol || !token || !name) {
    throw Error('Mail details not provided');
  }
  // TODO further checks
  // TODO Lang option
  return {
    from: mailOptions.sender || 'emailverification@g-old.com',
    to: email,
    subject: 'G-old Verification Link',
    text: `Hi ${name}! \n\n Thanks so much for joining GOLD. To finish signing up, you just \n need to confirm that we got your email right. \n \n
    Please click on the following link, or paste this into your browser :\n\n ${connection.protocol}://${connection.host}/verify/${token} \n\n
    `,
  };
};

export const emailChangedMail = (email, connection, token, name) => {
  if (!email || !connection || !connection.host || !connection.protocol || !token || !name) {
    throw Error('Mail details not provided');
  }
  // TODO further checks
  // TODO Lang option
  return {
    from: mailOptions.sender || 'emailverification@g-old.com',
    to: email,
    subject: 'G-old Email changed',
    text: `Hi ${name}! \n\n You have changed your email address for your account on GOLD. You just \n need to confirm that we got your email right. \n \n
    Please click on the following link, or paste this into your browser :\n\n ${connection.protocol}://${connection.host}/verify/${token} \n\n
    `,
  };
};
