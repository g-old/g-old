import { throwIfMissing } from './utils';
import log from '../logger';

class MailService {
  constructor(transporter = throwIfMissing('Transport layer'), options = {}) {
    this.mailer = transporter;
    this.MAX_CONTENT_LENGTH = options.maxContentLength || 5000;
    this.DEFAULT_SENDER = options.defaultSender || 'info@g-old.org';
    this.MAX_RECEIVERS = options.maxReceivers || 200; // check if realistic
  }
  validateContent(content) {
    if (!content.length) {
      return false;
    }
    if (content.length < 3 || content.length > this.MAX_CONTENT_LENGTH) {
      return false;
    }
    return true;
  }

  validateRecipients(recipients) {
    if (recipients && recipients.length) {
      if (recipients.constructor === Array) {
        if (recipients.length > this.MAX_RECEIVERS) {
          return false;
        }
        return recipients.every(recipient => recipient.length);
      }
      return true;
    }
    return false;
  }

  checkMessage(message) {
    const errors = [];
    if (message.constructor === Array) {
      errors.push('Only one message allowed!');
      return errors;
    }
    if ('html' in message || 'text' in message) {
      if (!this.validateContent(message.html || message.text)) {
        errors.push(`Content is invalid!`);
      }
    } else {
      errors.push('Content is missing!');
    }
    if ('recipient' in message) {
      if (!this.validateRecipients(message.recipient)) {
        errors.push(`Recipient(s) is invalid!`);
      }
    } else {
      errors.push('Recipient is missing!');
    }

    return errors.length ? errors : false;
  }
  send(mail) {
    return new Promise((resolve, reject) => {
      this.mailer.sendMail(mail, (err, data) => {
        this.mailer.close();
        if (err) reject(err);
        resolve(data);
      });
    });
  }
  async sendEmail(message) {
    const notOkay = this.checkMessage(message);
    if (notOkay) {
      return { success: false, errors: notOkay };
    }
    let content = 'text';
    if (message.html) {
      content = 'html';
    }
    try {
      await this.send({
        from: message.sender || this.DEFAULT_SENDER,
        to: message.recipient,
        subject: message.subject || '',
        [content]: message[content],
      });
    } catch (err) {
      const errorMessage = 'Email sending failed';
      log.error({ err, message }, errorMessage);
      return {
        success: false,
        errors: [err.message, errorMessage],
        errorCode: err.code,
      };
    }
    return { success: true };
  }
}

export default MailService;
