import nodemailer from 'nodemailer';

const config = require('../config');

const mailOptions = config.mailer;
const Transporter = nodemailer.createTransport(mailOptions.config);

const composeMail = ({ lang, type, connection, token, address, name }) => {
  const mailContent = {
    'de-DE': {
      resetMail: {
        subject: 'VIP Passwortänderung',
        text: `Hallo ${name}! \n\n
          Wir schicken Ihnen diese Email, da Sie (oder jemand anderes) das Password für ihr Konto zurücksetzen möchten.\n\n
          Bitte klicken Sie auf den folgenden Link, oder fügen Sie ihn in Ihrem Browser ein, um den Vorgang abzuschließen:\n\n
          ${connection.protocol}://${connection.host}${
          process.env.EPORT ? `:${process.env.EPORT}` : ''
        }/reset/${token}\n\n
          Wenn Sie das nicht angefragt haben, ignorieren Sie bitte diese Email, ihr Passwort bleibt dann unverändert.\n`,
      },
      resetSuccess: {
        subject: 'VIP - Ihr Passwort wurde geändert!',
        text: `Hallo ${name},\n\n dies ist die Bestätigung, dass das Passwort für ihr Konto ${address} gerade geändert wurde.\n`,
      },
      verification: {
        subject: 'VIP - Bestätigungslink',
        text: `Hallo ${name}! \n\n Wir freuen uns sehr, dass Sie sich hier auf der Plattform VIP angemeldet haben. Jetzt müssen Sie \n nur noch bestätigen, dass wir die korrekte Email-Adresse erhalten haben. \n \n
        Bitte klicken Sie auf den folgenden Link, oder fügen Sie ihn in Ihrem Browser ein:\n\n ${
          connection.protocol
        }://${connection.host}${
          process.env.EPORT ? `:${process.env.EPORT}` : ''
        }/verify/${token} \n\n
        `,
      },
      mailChange: {
        subject: 'VIP Email-Adresse geändert!',
        text: `Hallo ${name}! \n\n Sie haben Ihre Email-Adresse auf der Plattform VIP geändert. Sie müssen \n nur noch bestätigen, dass wir die korrekte Email-Adresse erhalten haben. \n \n
        Bitte klicken Sie auf den folgenden Link, oder fügen Sie ihn in Ihrem Browser ein:\n\n ${
          connection.protocol
        }://${connection.host}${
          process.env.EPORT ? `:${process.env.EPORT}` : ''
        }/verify/${token} \n\n
        `,
      },
    },
    'en-EN': {
      resetMail: {
        subject: 'VIP Password Reset',
        text: `Hi ${name}! \n\n
          You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          ${connection.protocol}://${connection.host}${
          process.env.EPORT ? `:${process.env.EPORT}` : ''
        }/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      },
      resetSuccess: {
        subject: 'Your password has been changed',
        text: `Hello ${name},\n\n This is a confirmation that the password for your account ${address} has just been changed.\n`,
      },
      verification: {
        subject: 'VIP Verification Link',
        text: `Hi ${name}! \n\n Thanks so much for joining VIP. To finish signing up, you just \n need to confirm that we got your email right. \n \n
        Please click on the following link, or paste this into your browser :\n\n ${
          connection.protocol
        }://${connection.host}${
          process.env.EPORT ? `:${process.env.EPORT}` : ''
        }/verify/${token} \n\n
        `,
      },
      mailChange: {
        subject: 'VIP Email changed',
        text: `Hi ${name}! \n\n You have changed your email address for your account on VIP. You just \n need to confirm that we got your email right. \n \n
        Please click on the following link, or paste this into your browser :\n\n ${
          connection.protocol
        }://${connection.host}${
          process.env.EPORT ? `:${process.env.EPORT}` : ''
        }/verify/${token} \n\n
        `,
      },
    },
  };

  return mailContent[lang]
    ? mailContent[lang][type]
    : mailContent['en-EN'][type];
};

export const resetLinkMail = (email, connection, token, name, lang) => {
  if (!email || !connection || !connection.host || !token || !name) {
    throw Error('Mail details not provided');
  }
  // TODO further checks
  // TODO Lang option
  const content = composeMail({
    lang,
    email,
    connection,
    token,
    name,
    type: 'resetMail',
  });
  return {
    from: mailOptions.sender || 'passwordreset@VIP.com',
    to: email,
    subject: content.subject,
    text: content.text,
  };
};
export const sendMail = mail =>
  new Promise((resolve, reject) => {
    Transporter.sendMail(mail, (err, data) => {
      Transporter.close();
      if (err) reject(err);
      resolve(data);
    });
  }).then(info => {
    // TODO ONLY for TESTING!
    console.info(info.envelope);
    console.info(info.messageId);
    console.info(info.message);
  });

export const resetSuccessMail = ({ address, name, connection, lang }) => {
  if (!address || !name) throw Error('Mail details not provided');
  const content = composeMail({
    lang,
    address,
    name,
    connection,
    type: 'resetSuccess',
  });
  return {
    from: mailOptions.sender || 'passwordreset@VIP.com',
    to: address,
    subject: content.subject,
    text: content.text,
  };
};

export const emailVerificationMail = (email, connection, token, name, lang) => {
  if (
    !email ||
    !connection ||
    !connection.host ||
    !connection.protocol ||
    !token ||
    !name
  ) {
    throw Error('Mail details not provided');
  }
  // TODO further checks
  // TODO Lang option
  const content = composeMail({
    lang,
    connection,
    token,
    email,
    name,
    type: 'verification',
  });
  return {
    from: mailOptions.sender || 'emailverification@VIP.com',
    to: email,
    subject: content.subject,
    text: content.text,
  };
};

export const emailChangedMail = (email, connection, token, name, lang) => {
  if (
    !email ||
    !connection ||
    !connection.host ||
    !connection.protocol ||
    !token ||
    !name
  ) {
    throw Error('Mail details not provided. Fn: emailChangedMail');
  }
  // TODO further checks
  // TODO Lang option
  const content = composeMail({
    lang,
    email,
    connection,
    token,
    name,
    type: 'mailChange',
  });
  return {
    from: mailOptions.sender || 'emailverification@VIP.com',
    to: email,
    subject: content.subject,
    text: content.text,
  };
};

export const notificationMail = ({ address, message, subject }) => {
  if (!address || !message) throw Error('Mail details not provided');
  return {
    from: mailOptions.sender || 'info@dirdemdi.org',
    to: address,
    subject,
    text: message,
  };
};
