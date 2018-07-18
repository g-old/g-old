import Sendgrid from '@sendgrid/mail';
import config from '../config';

Sendgrid.setApiKey(config.SENDGRID_API_KEY);

class Transporter {
  constructor(SendGrid) {
    this.sendGrid = SendGrid;
  }

  sendMail(message, cb) {
    // we could pass cb as third args
    this.sendGrid
      .send(message)
      .then(result => cb(null, result), error => cb(error)); // promise to cb
  }
  close() {} // eslint-disable-line
}

export default new Transporter(Sendgrid);
