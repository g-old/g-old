// @flow
import { throwIfMissing } from './utils';
import log from '../logger';
import type { Emails, Email } from './NotificationService';

type Receiver = Array | string;
type RawEmail = {
  from: string,
  to: Receiver,
  html: string,
  text?: ?string,
  subject: ?string,
  isMultiple?: boolean,
};
type CallBack = (error?: mixed, result?: {}) => any;
interface Transporter {
  sendMail: (message: RawEmail, cb: CallBack) => Promise<any>;
  close: () => void;
}

class MailService {
  mailer: Transporter;

  MAX_CONTENT_LENGTH: number;

  DEFAULT_SENDER: string;

  MAX_RECEIVERS: number;

  constructor(transporter = throwIfMissing('Transport layer'), options = {}) {
    this.mailer = transporter;
    this.MAX_CONTENT_LENGTH = options.maxContentLength || 10000;
    this.DEFAULT_SENDER = options.defaultSender || 'info@mycompany.org';
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
        // this.mailer.close();
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  sendMultiple(mail: Email) {
    return new Promise((resolve, reject) => {
      this.mailer.sendMail(
        {
          from: this.DEFAULT_SENDER,
          to: mail.receivers,
          subject: mail.htmlContent.subject,
          html: mail.htmlContent.html,
          isMultiple: true,
        },
        (err, data) => {
          // this.mailer.close();
          if (err) reject(err);
          resolve(data);
        },
      );
    }).then(data => {
      if (__DEV__) {
        console.info(data);
      }
    });
  }

  sendSingleMail(receiver: string, mail: Email) {
    return new Promise((resolve, reject) => {
      this.mailer.sendMail(
        {
          from: this.DEFAULT_SENDER,
          to: receiver,
          subject: mail.htmlContent.subject,
          html: mail.htmlContent.html,
          text: mail.text,
        },
        (err, data) => {
          // this.mailer.close(); // don't close if pooling connections (production)?
          if (err) reject(err);
          resolve(data);
        },
      );
    }).then(data => {
      if (__DEV__) {
        console.info(data);
      }
    });
  }

  async sendEmail(message) {
    const notOkay = this.checkMessage(message);

    if (notOkay) {
      return { success: false, errors: notOkay };
    }

    try {
      const messageData = {
        from: this.DEFAULT_SENDER,
        to: message.isMultiple ? [message.recipient] : message.recipient,
        subject: message.subject || '',
        ...(message.html && { html: message.html }),
        ...(message.text && { text: message.text }),
        ...(message.isMultiple && { isMultiple: true }),
      };

      const data = await this.send(messageData);

      // TODO notify success
      // TODO bulk mails

      if (__DEV__) {
        console.info(data);
      }
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

  /* async sendAllEmails(emails: Emails) {
    return emails.forEach(mail => this.sendMultiple(mail));
  } */
  async sendAllEmails(emails: Emails) {
    const mailPromises = [];
    emails.forEach(mail =>
      mail.receivers.forEach(receiver =>
        mailPromises.push(
          this.sendSingleMail(receiver, mail).catch(e =>
            log.error({ err: e }, 'Mail failed'),
          ),
        ),
      ),
    );

    await Promise.all(mailPromises);
    // this.mailer.close();
  }
}

export default MailService;
