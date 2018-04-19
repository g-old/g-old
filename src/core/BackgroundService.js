import { throwIfMissing } from './utils';
import { TransportType } from './MessageService';

export const EmailType = {
  WELCOME: 1,
  VERIFICATION: 2,
  RESET_REQUEST: 3,
  RESET_SUCCESS: 4,
  MESSAGE: 5,
  TEST_BATCH: 6,
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
    const emailTransport = TransportType.EMAIL;
    switch (mailType) {
      case EmailType.WELCOME: {
        return this.messager.sendWelcomeMessage(
          emailData.viewer,
          emailTransport,
          emailData.lang,
        );
      }
      case EmailType.VERIFICATION: {
        return this.messager.sendVerificationMessage(
          emailData.viewer,
          emailData.address,
          emailTransport,
          emailData.lang,
        );
      }
      case EmailType.RESET_REQUEST: {
        return this.messager.sendResetRequestMessage(
          emailData.viewer,
          emailTransport,
          emailData.lang,
        );
      }
      case EmailType.RESET_SUCCESS: {
        return this.messager.sendResetNotificationMessage(
          emailData.viewer,
          emailTransport,
          emailData.lang,
        );
      }
      case EmailType.MESSAGE: {
        return this.messager.sendMessage(
          emailData.recipient,
          { content: emailData.message, subject: emailData.subject },
          emailData.viewer,
          emailTransport,
          emailData.lang,
        );
      }
      case EmailType.TEST_BATCH: {
        return this.messager.sendBatchMessages(emailData);
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
