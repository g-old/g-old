import { throwIfMissing } from './utils';
import log from '../logger';

export const TransportTypes = {
  EMAIL: 1,
  DATABASE: 2,
};

class MessageService {
  constructor(
    mailService = throwIfMissing('Email service'),
    messageRepo = throwIfMissing('Message respository'),
    mailComposer = throwIfMissing('Mail composer'),
    tokenService = throwIfMissing('Token service'),
    //  eventSrc = throwIfMissing('Event source'),
  ) {
    this.mailer = mailService;
    this.msgRepo = messageRepo;
    this.mailComposer = mailComposer;
    this.tokens = tokenService;
    //  this.events = eventSrc;
    this.protocol = 'https';
    this.host = 'g-old.org';
  }

  async notify(
    msg = throwIfMissing('msg'),
    recipients = throwIfMissing('recipients'),
    transportType,
  ) {
    let receivers;
    if (recipients.constructor !== Array) {
      receivers = [recipients];
    } else {
      receivers = [...recipients];
    }
    const messagePromises = receivers.map(receiver =>
      this.send(msg, receiver, transportType),
    );
    const result = await Promise.all(messagePromises);
    return { result };
  }

  async send(message, receiver, transportType) {
    if (receiver.constructor === Array) {
      // maybe bulk
    }
    let result;
    switch (transportType) {
      case TransportTypes.EMAIL: {
        if (message.html) {
          result = await this.mailer.sendEmail(message);
        } else {
          throw new Error('Text emails not implemented');
        }
        break;
      }
      case TransportTypes.DATABASE: {
        result = this.msgRepo.insertMessage(message, receiver);
        break;
      }
      default:
        throw Error(`TransportType not recognized! : ${transportType}`);
    }
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  getTransportTypes(types) {
    if (types.constructor !== Array) {
      return [types];
    }
    return types;
  }

  static combineResults(results) {
    return {
      success: results.every(res => res.success),
      errors: results.reduce((acc, curr) => {
        if (curr.errors && curr.errors.length) {
          return acc.concat(curr.errors);
        }
        return acc;
      }, []),
    };
  }
  createLink(token, route) {
    return ` ${this.protocol}://${this.host}}/${route}/${token}`;
  }
  createVerificationLink(token) {
    return this.createLink(token, 'verify');
  }
  createResetLink(token) {
    return this.createLink(token, 'reset');
  }
  static createHTMLMessage(content, recipient) {
    return {
      recipient,
      html: content.html,
      subject: content.subject,
    };
  }
  async sendWelcomeMessage(user, transportTypes = [], locale) {
    const types = this.getTransportTypes(transportTypes);
    try {
      const promises = types.map(async type => {
        switch (type) {
          case TransportTypes.EMAIL: {
            if (!user.email) {
              throw new Error('Email address needed');
            }

            const token = await this.tokens.createAndStoreEmailToken(
              user.email,
            );
            const link = this.createVerificationLink(token);
            const personalizedMail = this.mailComposer.getWelcomeMail(
              user,
              link,
              locale,
            );
            const finalMessage = MessageService.createHTMLMessage(
              personalizedMail,
              user.email,
            );
            return this.send(finalMessage, user.email, type);
          }
          case TransportTypes.DATABASE: {
            throw new Error('To implement');
          }

          default:
            throw new Error('Type not recognizes');
        }
      });
      const results = await Promise.all(promises);
      return MessageService.combineResults(results);
    } catch (err) {
      log.error({ err, user }, 'Welcome mail error');
      return { success: false, errors: [err.message] };
    }
  }
  async sendVerificationMessage(user, transportTypes = [], locale) {
    const types = this.getTransportTypes(transportTypes);
    try {
      const promises = types.map(async type => {
        switch (type) {
          case TransportTypes.EMAIL: {
            if (!user.email) {
              throw new Error('Email address needed');
            }

            const token = await this.tokens.createAndStoreEmailToken(
              user.email,
            );
            const link = this.createVerificationLink(token);
            const personalizedMail = this.mailComposer.getEmailVerificationMail(
              user,
              link,
              locale,
            );
            const finalMessage = MessageService.createHTMLMessage(
              personalizedMail,
              user.email,
            );
            return this.send(finalMessage, user.email, type);
          }
          case TransportTypes.DATABASE: {
            throw new Error('To implement');
          }

          default:
            throw new Error('Type not recognizes');
        }
      });
      const results = await Promise.all(promises);
      return MessageService.combineResults(results);
    } catch (err) {
      log.error({ err, user }, 'Verification mail error');
      return { success: false, errors: [err.message] };
    }
  }
  async sendResetRequestMessage(user, transportTypes = [], locale) {
    const types = this.getTransportTypes(transportTypes);
    try {
      const promises = types.map(async type => {
        switch (type) {
          case TransportTypes.EMAIL: {
            if (!user.email) {
              throw new Error('Email address needed');
            }

            const token = await this.tokens.createAndStoreResetToken(
              user.email,
            );
            const link = this.createVerificationLink(token);
            const personalizedMail = this.mailComposer.getResetRequestMail(
              user,
              link,
              locale,
            );
            const finalMessage = MessageService.createHTMLMessage(
              personalizedMail,
              user.email,
            );
            return this.send(finalMessage, user.email, type);
          }
          case TransportTypes.DATABASE: {
            throw new Error('To implement');
          }

          default:
            throw new Error('Type not recognizes');
        }
      });
      const results = await Promise.all(promises);
      return MessageService.combineResults(results);
    } catch (err) {
      log.error({ err, user }, 'Reset request mail error');
      return { success: false, errors: [err.message] };
    }
  }
  async sendResetNotificationMessage(user, transportTypes = [], locale) {
    const types = this.getTransportTypes(transportTypes);
    try {
      const promises = types.map(async type => {
        switch (type) {
          case TransportTypes.EMAIL: {
            if (!user.email) {
              throw new Error('Email address needed');
            }

            const personalizedMail = this.mailComposer.getResetNotificationMail(
              user,
              locale,
            );
            const finalMessage = MessageService.createHTMLMessage(
              personalizedMail,
              user.email,
            );
            return this.send(finalMessage, user.email, type);
          }
          case TransportTypes.DATABASE: {
            throw new Error('To implement');
          }

          default:
            throw new Error('Type not recognizes');
        }
      });
      const results = await Promise.all(promises);
      return MessageService.combineResults(results);
    } catch (err) {
      log.error({ err, user }, 'Reset notification mail error');
      return { success: false, errors: [err.message] };
    }
  }
  static validateMessage(message = throwIfMissing('message')) {
    const msg = {};
    if (message.constructor === String) {
      if (message.length > 0) {
        msg.content = message;
      }
    } else {
      if (message.content && message.content.constructor === String) {
        msg.content = message.content;
      } else {
        throw new Error('Field not a string');
      }
      if (message.subject && message.subject.constructor === String) {
        msg.subject = message.subject;
      }
    }
    return msg;
  }
  // eslint-disable-next-line
  sendInternalMessage() {
    throw new Error('Not impmelented');
  }
  async sendMessage(user, message, sender, transportTypes, locale) {
    const types = this.getTransportTypes(transportTypes);

    const msg = MessageService.validateMessage(message);
    try {
      const promises = types.map(async type => {
        switch (type) {
          case TransportTypes.EMAIL: {
            if (!user.email) {
              throw new Error('Email address needed');
            }
            return this.sendEmailMessage(user, msg, sender, locale);
          }
          case TransportTypes.DATABASE: {
            return this.sendInternalMessage(user, msg, sender);
          }

          default:
            throw new Error('Type not recognizes');
        }
      });
      const results = await Promise.all(promises);
      return MessageService.combineResults(results);
    } catch (err) {
      log.error({ err, user }, 'Message error');
      return { success: false, errors: [err.message] };
    }
  }
  async sendEmailMessage(user, message, sender, locale) {
    try {
      const personalizedMail = this.mailComposer.getMessageMail(
        user,
        message,
        sender,
        locale,
      );
      const finalMessage = MessageService.createHTMLMessage(
        personalizedMail,
        user.email,
      );

      return this.send(finalMessage, user.email, TransportTypes.EMAIL);
    } catch (err) {
      log.error({ err, user }, 'Send email message error');
      return { success: false, errors: [err.message] };
    }
  }
  /*
  sendPasswordLinkMessage() {}
  sendEmailChangedMessage() {}
  sendMembershipChangedMessage() {}
  */
}
export default MessageService;
