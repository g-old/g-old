import { throwIfMissing } from './utils';

export const TransportTypes = {
  EMAIL: 1,
  DATABASE: 2,
};

class MessageService {
  constructor(
    mailService = throwIfMissing('Email service'),
    messageRepo = throwIfMissing('Message respository'),
  ) {
    this.mailer = mailService;
    this.msgRepo = messageRepo;
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
      this.sendMessage(msg, receiver, transportType),
    );
    const result = await Promise.all(messagePromises);
    return { result };
  }

  async sendMessage(message, receiver, transportType) {
    if (receiver.constructor === Array) {
      // maybe bulk
    }
    let result;
    switch (transportType) {
      case TransportTypes.MAIL: {
        result = await this.mailService.sendEmail(message, receiver);
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
      return [];
    }
    return types;
  }

  sendWelcomeMessage(user, transportTypes = []) {
    const types = this.getTransportTypes(transportTypes);
    if (types.includes(TransportTypes.EMAIL)) {
      if (!user.email) {
        throw new Error('Email address needed');
      }
    }
    let message;
    types.map(type => this.sendMessage(message, user.email, type));
  }
  /*
  sendPasswordResetMessage() {}
  sendPasswordLinkMessage() {}
  sendEmailChangedMessage() {}
  sendMembershipChangedMessage() {}
  */
}
export default MessageService;
