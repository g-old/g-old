/* eslint-env jest */

import MailService from './MailService';

const mockTransporter = (mails, error) => ({
  sendMail: (mail, fn) => {
    mails.push(mail);
    if (error) {
      fn(error);
    } else {
      fn(null, 'Success');
    }
  },
  close: () => {},
});

describe('MailService', () => {
  it('Should sent html email', async () => {
    const mails = [];

    const mailService = new MailService(mockTransporter(mails));
    const emailObject = {
      html: 'mock-html',
      recipient: 'mock-recipient',
    };
    const result = await mailService.sendEmail(emailObject);
    expect(result.success).toBe(true);
  });

  it('Should fail correctly', async () => {
    const mails = [];
    const error = { message: 'mock-error' };
    const mailService = new MailService(mockTransporter(mails, error));
    const emailObject = {
      html: 'mock-html',
      recipient: 'mock-recipient',
    };
    const result = await mailService.sendEmail(emailObject);
    expect(result.errors).toContain(error.message);
  });
});
