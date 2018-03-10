/* eslint-env jest */

import knex from '../knex';
import createLoaders from '../dataLoader';
import { Groups } from '../../organization';
import Group from '../models/Group';
import {
  clearDB,
  createTestActor,
  createTestUser,
  createGroup,
} from '../../../test/utils';

jest.setTimeout(10000);

describe('Group', () => {
  beforeEach(() => clearDB());
  describe('Group.join', () => {
    it('Should not allow exclusive members of [Groups.GUEST] to join a WT', async () => {
      const testCoordinator = createTestUser();
      const testUser = createTestUser({ groups: Groups.GUEST });
      const [uID, cID] = await knex('users')
        .insert([testUser, testCoordinator])
        .returning('id');
      const testViewer = createTestActor({ id: uID, groups: Groups.GUEST });
      const [testGroupData] = await knex('groups')
        .insert(createGroup({ coordinatorId: cID }))
        .returning('*');
      const testGroup = new Group(testGroupData);
      const maybeFailJoinResult = await testGroup.join(
        testViewer,
        testViewer.id,
        createLoaders(),
      );

      expect(maybeFailJoinResult).toBeNull();

      const [maybeFailId] = await knex('user_groups')
        .where({ user_id: testViewer.id })
        .returning('group_id');
      expect(maybeFailId).not.toBeDefined();
    });

    it('Should  allow  members of [Groups.VOTER] to join a WT', async () => {
      const testCoordinator = createTestUser();
      const testUser = createTestUser({ groups: Groups.VOTER });
      const [uID, cID] = await knex('users')
        .insert([testUser, testCoordinator])
        .returning('id');
      const testViewer = createTestActor({
        id: uID,
        groups: Groups.VOTER,
      });
      const [testGroupData] = await knex('groups')
        .insert(createGroup({ coordinatorId: cID }))
        .returning('*');
      const testGroup = new Group(testGroupData);
      const maybeFailJoinResult = await testGroup.join(
        testViewer,
        testViewer.id,
        createLoaders(),
      );

      expect(maybeFailJoinResult).toBeDefined();

      const [maybeFailId] = await knex('user_groups')
        .where({ user_id: testViewer.id })
        .pluck('group_id');
      expect(maybeFailId).toBe(testGroupData.id);
    });
  });
});
