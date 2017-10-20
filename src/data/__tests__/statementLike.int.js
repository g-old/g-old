/* eslint-env jest */

import knex from '../knex';
import createLoaders from '../dataLoader';
import { Groups } from '../../organization';
import StatementLike from '../models/StatementLike';
import {
  clearDB,
  createTestActor,
  createTestUser,
  createProposal,
  createPoll,
  createPollingMode,
  createStatement,
} from '../../../test/utils';

jest.setTimeout(10000);

const setup = async () => {
  const proposedModeId = 1;
  const votingModeId = 2;
  const pollingModeProposed = createPollingMode({
    mode: 'proposed',
    id: proposedModeId,
  });
  const pollingModeVoting = createPollingMode({
    mode: 'voting',
    id: votingModeId,
  });
  const [pm1, pm2] = await knex('polling_modes')
    .insert([pollingModeProposed, pollingModeVoting])
    .returning('id');
  const testAuthor = createTestUser({
    groups: Groups.RELATOR,
    email: `relator${Math.random()}@example.com`,
  });
  const testVoter1 = createTestUser({
    groups: Groups.VOTER,
    email: `voter${Math.random()}@example.com`,
  });
  const testVoter2 = createTestUser({
    groups: Groups.VOTER,
    email: `voter${Math.random()}@example.com`,
  });
  const [a, v, v2] = await knex('users')
    .insert([testAuthor, testVoter1, testVoter2])
    .returning('id');
  const pollOne = createPoll({ modeId: pm1, endTime: 10 });
  const pollTwo = createPoll({ modeId: pm2, endTime: 10 });
  const [p1, p2] = await knex('polls')
    .insert([pollOne, pollTwo])
    .returning('id');
  const proposal = createProposal({
    pollOneId: p1,
    pollTwoId: p2,
    authorId: a,
  });

  const [prop] = await knex('proposals')
    .insert(proposal)
    .returning('id');

  const [vote] = await knex('votes')
    .insert({
      user_id: v2,
      position: 'pro',
      poll_id: p2,
    })
    .returning('id');
  return {
    proposalId: prop,
    pollOneId: p1,
    pollTwoId: p2,
    voterId: v,
    voteId: vote,
  };
};

describe('StatementLike Model', () => {
  beforeEach(() => clearDB());

  describe('StatementLike.create', () => {
    it('Should not allow self-liking', async () => {
      const id = 1;
      const testViewer = createTestActor({ id, groups: Groups.VOTER });
      const testUser = createTestUser({ id });
      await knex('users').insert(testUser);

      const STATEMENT_ID = 1;
      const { pollTwoId, voteId } = await setup();
      const testStatement = createStatement({
        id: STATEMENT_ID,
        pollId: pollTwoId,
        authorId: 1,
        voteId,
      });
      await knex('statements').insert(testStatement);

      const testData = { statementId: STATEMENT_ID };
      const likeResult = await StatementLike.create(
        testViewer,
        testData,
        createLoaders(),
      );
      expect(likeResult).toBeNull();
      const [statement] = await knex('statements')
        .where({ id: STATEMENT_ID })
        .select('likes');
      expect(statement.likes).toBe(0);
    });
  });
});
