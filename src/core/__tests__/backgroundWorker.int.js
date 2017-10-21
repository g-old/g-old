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
jest.setTimeout(10000);
describe('Background Worker Integration', () => {
  it('Should send emails via sendgrid', async () => {
    const testActor = createTestActor({ permissions: Permissions.NOTIFY_ALL });
    const messageData = {
      type: 'mail',
      data: {
        mailType: 'notification',
        message: `Integration @ ${new Date()}`,
        subject: 'Info from GOLD',
        address: 'testg@byom.de',
        viewer: testActor,
        mail_settings: {
          // for testing - counts for the limit -email ist NOT delivered
          // Internet connection required!
          sandbox_mode: {
            enable: true,
          },
        },
      },
      viewer: testActor,
    };
    // eslint-disable-next-line no-underscore-dangle
    const handleMessages = backgroundWorker.__get__('handleMessages');
    const res = await handleMessages(messageData);
    expect(res).toBeDefined();
    expect(res[0].statusCode).toBeGreaterThanOrEqual(200);
    expect(res[0].statusCode).toBeLessThan(300);
  });

  it('Should generate a email with link to reset the password', async () => {
    await clearDB();
    const mockMailer = {
      send: data => Promise.resolve(data),
    };
    /* eslint-disable no-underscore-dangle */
    backgroundWorker.__set__('Mailer', mockMailer);
    const testUser = createTestUser();
    const [uID] = await knex('users')
      .insert(testUser)
      .returning('id');
    const testActor = createTestActor({
      permissions: Permissions.NOTIFY_ALL,
      id: uID,
      email: testUser.email,
    });
    const connection = { host: '127.0.0.1', protocol: 'https' };
    const messageData = {
      type: 'mail',
      data: {
        mailType: 'resetPassword',
        address: testUser.email,
        viewer: testActor,
        lang: 'de-DE',
        connection,
      },
      viewer: testActor,
    };
    // eslint-disable-next-line no-underscore-dangle
    const handleMessages = backgroundWorker.__get__('handleMessages');
    const res = await handleMessages(messageData);
    expect(res).toBeDefined();
    expect(res.text).toMatch(connection.host);
  });
});
