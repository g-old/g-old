/* eslint-env jest */
import { createTestUser } from '../../test/utils';

import MessageService, { TransportTypes } from './MessageService';

const mockMailService = () => ({
  sendEmail: async () => ({ success: true }),
});
const mockMessageRepo = repo => ({
  insertMessage: msg => {
    repo.push(msg);
  },
});
const mockMailComposer = () => ({
  getWelcomeMail: () => ({ subject: 'mockSubject', html: 'mockHtml' }),
  getResetRequestMail: () => ({ subject: 'mockSubject', html: 'mockHtml' }),
  getResetNotificationMail: () => ({
    subject: 'mockSubject',
    html: 'mockHtml',
  }),
  getMessageMail: () => ({ subject: 'mockSubject', html: 'mockHtml' }),
  getEmailVerificationMail: () => ({
    subject: 'mockSubject',
    html: 'mockHtml',
  }),
});
const mockTokenService = () => ({
  createAndStoreEmailToken: async () => 'mock-verify-token',
  createAndStoreResetToken: async () => 'mock-reset-token',
});

const initMessageService = () => {
  const mails = [];
  const repo = [];
  const mailData = [];

  return new MessageService(
    mockMailService(mails),
    mockMessageRepo(repo),
    mockMailComposer(mailData),
    mockTokenService(),
  );
};
describe('MessageService', () => {
  it('Should sent welcome mail', async () => {
    const messageService = initMessageService();
    const user = createTestUser();
    const result = await messageService.sendWelcomeMessage(
      user,
      TransportTypes.EMAIL,
      'de-DE',
    );
    expect(result.success).toBe(true);
  });
  it('Should sent reset request mail', async () => {
    const messageService = initMessageService();
    const user = createTestUser();
    const result = await messageService.sendResetRequestMessage(
      user,
      TransportTypes.EMAIL,
      'de-DE',
    );
    expect(result.success).toBe(true);
  });

  it('Should sent reset notification mail', async () => {
    const messageService = initMessageService();
    const user = createTestUser();
    const result = await messageService.sendResetNotificationMessage(
      user,
      TransportTypes.EMAIL,
      'de-DE',
    );
    expect(result.success).toBe(true);
  });

  it('Should verification mail', async () => {
    const messageService = initMessageService();
    const user = createTestUser();
    const result = await messageService.sendVerificationMessage(
      user,
      TransportTypes.EMAIL,
      'de-DE',
    );
    expect(result.success).toBe(true);
  });

  it('Should sent message mail', async () => {
    const messageService = initMessageService();
    const user = createTestUser();
    const sender = createTestUser();
    const testMessage = { content: 'test-content', subject: 'test-subject' };

    const result = await messageService.sendMessage(
      user,
      testMessage,
      sender,
      TransportTypes.EMAIL,
    );
    expect(result.success).toBe(true);
  });

  it('Should fail if mail could not been sent', async () => {
    const mails = [];
    const repo = [];
    const mailData = [];
    const error = 'Mailservice failure';
    const mockFailureMailService = () => ({
      sendEmail: async () => ({ errors: [error] }),
    });

    const messageService = new MessageService(
      mockFailureMailService(mails),
      mockMessageRepo(repo),
      mockMailComposer(mailData),
      mockTokenService(),
    );
    const user = createTestUser();
    const result = await messageService.sendWelcomeMessage(
      user,
      TransportTypes.EMAIL,
      'de-DE',
    );
    expect(result.errors).toContain(error);
    expect(result.success).toBeFalsy();
  });
});
