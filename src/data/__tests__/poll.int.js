/* eslint-env jest */

import knex from '../knex';
import createLoaders from '../dataLoader';
import { Groups } from '../../organization';
import Poll from '../models/Poll';
import {
  clearDB,
  createTestActor,
  createTestUser,
  createPollingMode,
} from '../../../test/utils';

jest.setTimeout(10000);

describe('Poll Model', () => {
  beforeEach(() => clearDB());

  describe('Poll.create', () => {
    it('Should count only user with [Permissions.VOTE] ', async () => {
      const [pmID] = await knex('polling_modes')
        .insert(createPollingMode())
        .returning('id');

      const testVoter = createTestUser({ groups: Groups.VOTER });
      const superUser = createTestUser({ groups: Groups.SUPER_USER });
      await knex('users').insert([testVoter, superUser]);
      const testViewer = createTestActor({
        groups: Groups.RELATOR,
      });
      const pollData = {
        polling_mode_id: pmID,
        end_time: new Date(),
        threshold: 25,
      };
      const pollResult = await Poll.create(
        testViewer,
        pollData,
        createLoaders(),
      );

      expect(pollResult).toBeDefined();
      expect(pollResult.numVoter).toBe(1);
    });
  });
});
