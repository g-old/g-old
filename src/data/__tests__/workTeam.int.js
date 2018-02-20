/* eslint-env jest */

import knex from '../knex';
import createLoaders from '../dataLoader';
import { Groups } from '../../organization';
import WorkTeam from '../models/WorkTeam';
import {
  clearDB,
  createTestActor,
  createTestUser,
  createWorkTeam,
} from '../../../test/utils';

jest.setTimeout(10000);

describe('WorkTeam', () => {
  beforeEach(() => clearDB());
  describe('WorkTeam.join', () => {
    it('Should not allow exclusive members of [Groups.GUEST] to join a WT', async () => {
      const testCoordinator = createTestUser();
      const testUser = createTestUser({ groups: Groups.GUEST });
      const [uID, cID] = await knex('users')
        .insert([testUser, testCoordinator])
        .returning('id');
      const testViewer = createTestActor({ id: uID, groups: Groups.GUEST });
      const [testWorkTeamData] = await knex('work_teams')
        .insert(createWorkTeam({ coordinatorId: cID }))
        .returning('*');
      const testWorkTeam = new WorkTeam(testWorkTeamData);
      const maybeFailJoinResult = await testWorkTeam.join(
        testViewer,
        testViewer.id,
        createLoaders(),
      );

      expect(maybeFailJoinResult).toBeNull();

      const [maybeFailId] = await knex('user_work_teams')
        .where({ user_id: testViewer.id })
        .returning('work_team_id');
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
      const [testWorkTeamData] = await knex('work_teams')
        .insert(createWorkTeam({ coordinatorId: cID }))
        .returning('*');
      const testWorkTeam = new WorkTeam(testWorkTeamData);
      const maybeFailJoinResult = await testWorkTeam.join(
        testViewer,
        testViewer.id,
        createLoaders(),
      );

      expect(maybeFailJoinResult).toBeDefined();

      const [maybeFailId] = await knex('user_work_teams')
        .where({ user_id: testViewer.id })
        .pluck('work_team_id');
      expect(maybeFailId).toBe(testWorkTeamData.id);
    });
  });
});
