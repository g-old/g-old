import nodemailer from 'nodemailer';
// import options from '../../private_configs.js'

const Transporter = nodemailer.createTransport({
  jsonTransport: true,
});

export const resetLinkMail = (email, host, token) => {
  if (!email || !host || !token) throw Error('Mail details not provided');
  // TODO further checks
  // TODO Lang option
  return {
    from: 'passwordreset@g-old.com',
    to: email,
    subject: 'G-old Password Reset',
    text: `${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click on the following link, or paste this into your browser to complete the process:\n\nhttp://'}${host}/reset/${token}\n\n` +
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
export const resetSuccessMail = email => {
  if (!email) throw Error('Mail details not provided');
  return {
    from: 'passwordreset@g-old.com',
    to: email,
    subject: 'Your password has been changed',
    text: `${'Hello,\n\n This is a confirmation that the password for your account '}${email} has just been changed.\n`,
  };
};
