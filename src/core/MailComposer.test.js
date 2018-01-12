/* eslint-env jest */

import handlebars from 'handlebars';
import MailComposer from './MailComposer';

describe('ActivityService', () => {
  it('Should render welcome mail', () => {
    const composer = new MailComposer(handlebars);
    const testName = 'name';
    const testLink = 'testLink';
    const result = composer.getWelcomeMail({ name: testName }, testLink);
    expect(result).toContain(testName, testLink);
  });
});
