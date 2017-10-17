/* eslint-env jest */

import backgroundWorker from './backgroundWorker';
import { createTestActor } from '../../test/utils';

describe.only('Background Worker', () => {
  describe('Mails', () => {
    it('Should handle a notification sent by mail correctly', async () => {
      const testActor = createTestActor();
      const notification = {
        message: 'Message',
        subject: 'Subject',
      };
      const messageData = {
        mailType: 'notification',
        message: notification.message,
        subject: notification.subject || 'NO SUBJECT',
        viewer: testActor,
        address: testActor.email,
      };
      const mockMailer = {
        send: data => Promise.resolve(data),
      };
      /* eslint-disable no-underscore-dangle */
      backgroundWorker.__set__('Mailer', mockMailer);
      const handleMails = backgroundWorker.__get__('handleMails');
      /* eslint-enable no-underscore-dangle */

      const res = await handleMails(messageData);
      expect(res).toBeDefined();
      expect(res).toEqual(
        expect.objectContaining({
          to: messageData.address,
          subject: notification.subject,
          text: notification.message,
        }),
      );
    });
  });
});
