/* eslint-env jest */

import knex from '../knex';
import createLoaders from '../dataLoader';
import { Groups } from '../../organization';
import Proposal from '../models/Proposal';
import {
  clearDB,
  createTestActor,
  createWorkTeam,
  createTestUser,
  createPollingMode,
} from '../../../test/utils';

jest.setTimeout(10000);

describe('Proposal', () => {
  beforeEach(() => clearDB());
  const VOTER = Groups.VIEWER | Groups.VOTER; // eslint-disable-line no-bitwise
  describe('Proposal.isVotable', () => {
    test('Should allow members to vote', async () => {
      const [wtId] = await knex('work_teams')
        .insert(createWorkTeam())
        .returning('id');

      const [uId] = await knex('users')
        .insert(createTestUser({ groups: VOTER }))
        .returning('id');
      const creationTime = new Date(new Date().getTime() - 1000);
      await knex('user_work_teams').insert({
        user_id: uId,
        work_team_id: wtId,
        created_at: creationTime,
      });

      const actor = createTestActor({
        id: uId,
        groups: VOTER,
        wtMemberships: wtId,
      });
      const proposal = new Proposal({
        work_team_id: wtId,
        created_at: new Date(),
        state: 'proposed',
      });
      expect(await proposal.isVotable(actor)).toBe(true);
    });
  });
  describe.only('Proposal.create', () => {
    const PROPOSAL_MAKER = Groups.VIEWER | Groups.RELATOR; // eslint-disable-line no-bitwise
    test('Should make a proposal with only one voting phase and set state to voting', async () => {
      const [uId] = await knex('users')
        .insert(createTestUser({ groups: PROPOSAL_MAKER }))
        .returning('id');
      const actor = createTestActor({
        id: uId,
        groups: PROPOSAL_MAKER,
      });

      const [pmId] = await knex('polling_modes')
        .insert(createPollingMode({ mode: 'voting' }))
        .returning('id');

      const pollData = {
        mode: { id: pmId },
      };

      const proposalData = {
        poll: pollData,
        text: 'mock-text',
        title: 'mock-title',
        state: 'voting',
      };

      const proposal = await Proposal.create(
        actor,
        proposalData,
        createLoaders(),
      );
      expect(proposal).toEqual(
        expect.objectContaining({ state: 'voting', pollOne_id: null }),
      );
    });
  });
});
