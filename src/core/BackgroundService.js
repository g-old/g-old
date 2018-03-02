import { throwIfMissing } from './utils';
import { TransportTypes } from './MessageService';

export const EmailTypes = {
  WELCOME: 1,
  VERIFICATION: 2,
  RESET_REQUEST: 3,
  RESET_SUCCESS: 4,
  MESSAGE: 5,
};

export const ContentTypes = {
  PROPOSAL: 1,
  STATEMENT: 2,
  COMMENT: 3,
  MESSAGE: 4,
};

class BackgroundService {
  constructor(messageService = throwIfMissing('MessageService')) {
    this.messager = messageService;
  }

  async handleEmails(mailType, emailData) {
    const emailTransport = TransportTypes.EMAIL;
    switch (mailType) {
      case EmailTypes.WELCOME: {
        return this.messager.sendWelcomeMessage(
          emailData.viewer,
          emailTransport,
          emailData.lang,
        );
      }
      case EmailTypes.VERIFICATION: {
        return this.messager.sendVerificationMessage(
          emailData.viewer,
          emailData.address,
          emailTransport,
          emailData.lang,
        );
      }
      case EmailTypes.RESET_REQUEST: {
        return this.messager.sendResetRequestMessage(
          emailData.viewer,
          emailTransport,
          emailData.lang,
        );
      }
      case EmailTypes.RESET_SUCCESS: {
        return this.messager.sendResetNotificationMessage(
          emailData.viewer,
          emailTransport,
          emailData.lang,
        );
      }
      case EmailTypes.MESSAGE: {
        return this.messager.sendMessage(
          emailData.recipient,
          { content: emailData.message, subject: emailData.subject },
          emailData.viewer,
          emailTransport,
          emailData.lang,
        );
      }
      default: {
        throw new Error('Email type not recognizes');
      }
    }
  }
  /* handleWebpushNotification(contentType, data) {
    switch (contentType) {
      case ContentTypes.PROPOSAL:{
        this.messageService.sendPushNotification()
      }
        break;
      default:
    }
  } */
}

export default BackgroundService;
