/* eslint-env jest */

import backgroundWorker from '../backgroundWorker';
import { createTestActor, createTestUser, clearDB } from '../../../test/utils';
import { Permissions } from '../../organization';
import knex from '../../data/knex';

/*
const FILE_PATH = './backgroundWorker';
let worker;

const setupWorker = async handleMessages => {
  if (worker) {
    worker.kill();
  }
  worker = await cp.fork(FILE_PATH);
  worker.on('message', handleMessages);
}; */

const VALID_TEST_EMAIL = 'testg@byom.de';
jest.setTimeout(10000);
describe.skip('Background Worker Integration', () => {
  // eslint-disable-next-line no-underscore-dangle
  const handleMessages = backgroundWorker.__get__('handleMessages');

  it('Should send emails via sendgrid', async () => {
    const testActor = createTestActor({ permissions: Permissions.NOTIFY_ALL });
    const testRecipient = createTestUser({ email: VALID_TEST_EMAIL });
    const notificationMessageData = {
      type: 'mail',
      data: {
        mailType: 'message',
        message: `Integration @ ${new Date()}`,
        subject: 'Info from VIP',
        address: VALID_TEST_EMAIL,
        viewer: testActor,
        mail_settings: {
          // for testing - counts for the limit -email ist NOT delivered
          // Internet connection required!
          sandbox_mode: {
            enable: true,
          },
        },
        recipient: testRecipient,
      },
      viewer: testActor,
    };
    const res = await handleMessages(notificationMessageData);
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
  });

  it.only('Should generate a email with link to reset the password', async () => {
    await clearDB();

    /* eslint-disable no-underscore-dangle */
    const testUser = createTestUser({ email: VALID_TEST_EMAIL });
    const [uID] = await knex('users')
      .insert(testUser)
      .returning('id');
    const testActor = createTestActor({
      permissions: Permissions.NOTIFY_ALL,
      id: uID,
      email: testUser.email,
    });
    const connection = { host: '127.0.0.1', protocol: 'https' };
    const resetMessageData = {
      type: 'mail',
      data: {
        mailType: 'reet-request',

        address: testUser.email,
        viewer: testActor,
        lang: 'de-DE',
        connection,
      },
      viewer: testActor,
    };
    // eslint-disable-next-line no-underscore-dangle
    const res = await handleMessages(resetMessageData);
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
  });
});
