/* eslint-env jest */

import knex from '../knex';
import createLoaders from '../dataLoader';
import { Groups } from '../../organization';
import Discussion from '../models/Discussion';
import {
  clearDB,
  createTestActor,
  createWorkTeam,
  createTestUser,
} from '../../../test/utils';

jest.setTimeout(10000);

describe('Discussion', () => {
  beforeEach(() => clearDB());

  describe('Discussion.create', () => {
    test('Should allow to create a new discussion', async () => {
      const [wtId] = await knex('work_teams')
        .insert(createWorkTeam())
        .returning('id');

      const [vId] = await knex('users')
        .insert(createTestUser({ groups: Groups.RELATOR }))
        .returning('id');
      const actor = createTestActor({ id: vId, groups: Groups.RELATOR });
      const testData = { workteamId: wtId, title: 'title', content: 'content' };
      const discussion = await Discussion.create(
        actor,
        testData,
        createLoaders(),
      );
      expect(discussion).toEqual(expect.objectContaining(testData));
    });
  });
});
