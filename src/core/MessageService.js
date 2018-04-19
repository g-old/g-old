import { throwIfMissing } from './utils';
import log from '../logger';
import { ActivityType } from '../data/models/Activity';

export const TransportType = {
  EMAIL: 1,
  DATABASE: 2,
};

class MessageService {
  constructor(
    mailService = throwIfMissing('Email service'),
    messageRepo = throwIfMissing('Message respository'),
    mailComposer = throwIfMissing('Mail composer'),
    tokenService = throwIfMissing('Token service'),
    dbConnector = throwIfMissing('Database connector'),
    //  eventSrc = throwIfMissing('Event source'),
  ) {
    this.mailer = mailService;
    this.msgRepo = messageRepo;
    this.mailComposer = mailComposer;
    this.tokens = tokenService;
    this.dbConnector = dbConnector;
    //  this.events = eventSrc;
    this.protocol = __DEV__ ? 'http' : 'https';
    if (!__DEV__) {
      if (!process.env.HOST) {
        throw new Error('HOST environment variable not set!');
      }
    }
    this.host = process.env.HOST || 'localhost:3000';
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
    let result;
    if (receiver.constructor === Array) {
      if (transportType === TransportType.EMAIL) {
        if (message.html) {
          result = await this.mailer.sendEmail({
            ...message,
            isMultiple: true,
          });
        } else {
          throw new Error('Text emails not implemented');
        }
      } else {
        throw new Error('ONLY MAIL IMPLEMENTED FOR BULKMAILING');
      }
    } else {
      switch (transportType) {
        case TransportType.EMAIL: {
          if (message.html) {
            result = await this.mailer.sendEmail(message);
          } else {
            throw new Error('Text emails not implemented');
          }
          break;
        }
        case TransportType.DATABASE: {
          result = this.msgRepo.insertMessage(message, receiver);
          break;
        }
        default:
          throw Error(`TransportType not recognized! : ${transportType}`);
      }
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
    if (!results || results.constructor !== Array) {
      return {
        success: false,
        errors: ['No result returned'],
      };
    }
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
    return `${this.protocol}://${this.host}/${route}/${token}`;
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
          case TransportType.EMAIL: {
            if (!user.email) {
              throw new Error('Email address needed');
            }

            const token = await this.tokens.createAndStoreEmailToken(
              user.email,
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
          case TransportType.DATABASE: {
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
  async sendVerificationMessage(user, address, transportTypes = [], locale) {
    const types = this.getTransportTypes(transportTypes);
    try {
      const promises = types.map(async type => {
        switch (type) {
          case TransportType.EMAIL: {
            if (!address) {
              throw new Error('Email address needed');
            }
            const token = await this.tokens.createAndStoreEmailToken(
              user.email,
              address,
            );
            const link = this.createVerificationLink(token);
            const personalizedMail = this.mailComposer.getEmailVerificationMail(
              user,
              link,
              locale,
            );
            const finalMessage = MessageService.createHTMLMessage(
              personalizedMail,
              address,
            );
            return this.send(finalMessage, address, type);
          }
          case TransportType.DATABASE: {
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
          case TransportType.EMAIL: {
            if (!user.email) {
              throw new Error('Email address needed');
            }

            const token = await this.tokens.createAndStoreResetToken(
              user.email,
            );
            const link = this.createResetLink(token);
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
          case TransportType.DATABASE: {
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
          case TransportType.EMAIL: {
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
          case TransportType.DATABASE: {
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
          case TransportType.EMAIL: {
            if (!user || !user.email) {
              throw new Error('Email address needed');
            }
            return this.sendEmailMessage(user, msg, sender, locale);
          }
          case TransportType.DATABASE: {
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

      return this.send(finalMessage, user.email, TransportType.EMAIL);
    } catch (err) {
      log.error({ err, user }, 'Send email message error');
      return { success: false, errors: [err.message] };
    }
  }

  async sendBatchMessages(data) {
    const receiverIds = data.subscriberIds.values();
    // or pass  in, bc wee need it for push too
    const receiverData = await this.dbConnector('users')
      .whereIn('id', receiverIds)
      .select('id', 'email', 'locale');

    const groupedByLocale = receiverData.reduce(
      (acc, pos) => {
        (acc.byLocale[receiverData[pos.locale]] =
          acc.byLocale[receiverData[pos.locale]] || {})[receiverData[pos.id]] =
          receiverData[pos];
        acc.byId[receiverData[pos].id] = receiverData.pos;
        return acc;
      },
      { byLocale: {}, byId: {} },
    );

    // get all activities . objects

    // group activities by type

    const groupedByType = Object.keys(data.activities).reduce(
      (acc, activityId) => {
        (acc[data.activities[activityId.type]] =
          acc[data.activities[activityId.type]] || new Set()).add(
          data.activities[activityId.objectIds],
        );
        return acc;
      },
      {},
    );

    // load objects

    const mapTypeToTable = {
      [ActivityType.PROPOSAL]: 'proposals',
      [ActivityType.DISCUSSION]: 'discussions',
      [ActivityType.SURVEY]: 'proposals',
      [ActivityType.STATEMENT]: 'statements',
      [ActivityType.COMMENT]: 'comments',
      [ActivityType.MESSAGE]: 'messages',
    };

    //
    const allObjects = {};
    const promises = Object.keys(groupedByType).map(async type => {
      const objData = await this.dbConnector(mapTypeToTable[type])
        .whereIn('id', groupedByType[type].values())
        .select();
      allObjects[type] = objData.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return obj;
      }, {});
    });
    await Promise.all(promises);
    //

    await Object.keys(data.activities).map(async activityId => {
      const { activity } = data[activityId];

      switch (activity.type) {
        case ActivityType.PROPOSAL:
        case ActivityType.SURVEY:
        case ActivityType.DISCUSSION:
          data[activityId].subscribers.reduce((acc, sId) => {
            // get all by locale
            Object.keys(groupedByLocale.byLocale).map(locale => {
              // get all users/emails  with this locale
              const receiver = [];
              if (groupedByLocale.byLocale[locale][sId]) {
                receiver.push(groupedByLocale.byLocale[locale][sId].email);
              }

              const message = this.mailComposer.getNotificationMail(
                receiver,
                { content: allObjects[activity.type][activity.objectId].body },
                { name: 'gold' },
                locale,
              );
              return this.send(message, receiver, TransportType.EMAIL);
            });
            return acc;
          }, {});

          break;

        default:
          break;
      }
    });
  }
  /*
  sendPasswordLinkMessage() {}
  sendEmailChangedMessage() {}
  sendMembershipChangedMessage() {}
  */
}
export default MessageService;
