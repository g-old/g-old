/* eslint-env jest */

import handlebars from 'handlebars';
import MailComposer from './MailComposer';
import { createTestUser } from '../../test/utils';

describe('Mail composer', () => {
  const templateDir = '../../build/emails';
  it('Should render welcome mail', () => {
    const composer = new MailComposer(handlebars, templateDir);
    const testName = 'name';
    const testLink = 'testLink';
    const result = composer.getWelcomeMail({ name: testName }, testLink);
    expect(result.html).toContain(testName, testLink);
  });

  it('Should render welcome mail translated', () => {
    const composer = new MailComposer(handlebars, templateDir);
    const testName = 'name';
    const testLink = 'testLink';
    const result = composer.getWelcomeMail(
      { name: testName },
      testLink,
      'it-IT',
    );
    expect(result.html).toContain('Ciao');
  });
  it('Should render reset password mail', () => {
    const composer = new MailComposer(handlebars, templateDir);
    const testName = 'name';
    const testLink = 'testLink';
    const result = composer.getResetRequestMail({ name: testName }, testLink);
    expect(result.html).toContain(testLink);
  });
  it('Should render email verification  mail', () => {
    const composer = new MailComposer(handlebars, templateDir);
    const testName = 'name';
    const testLink = 'testLink';
    const result = composer.getEmailVerificationMail(
      { name: testName },
      testLink,
    );
    expect(result.html).toContain(testLink);
  });
  it('Should render reset notification  mail', () => {
    const composer = new MailComposer(handlebars, templateDir);
    const testName = 'name';
    const result = composer.getResetNotificationMail({ name: testName });
    expect(result.html).toContain(testName);
  });

  it('Should render message  mail', () => {
    const composer = new MailComposer(handlebars, templateDir);
    const testName = 'name';
    const testSender = createTestUser();
    const testMessage = { content: 'test-message' };
    const result = composer.getMessageMail(
      { name: testName },
      testMessage,
      testSender,
    );
    expect(result.html).toContain(testMessage.content);
  });
});
