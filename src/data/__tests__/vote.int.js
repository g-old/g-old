/* eslint-env jest */

import knex from '../knex';
import createLoaders from '../dataLoader';
import { Groups } from '../../organization';
import Vote from '../models/Vote';
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
  const testVoter = createTestUser({
    groups: Groups.VOTER,
    email: `voter${Math.random()}@example.com`,
  });
  const [a, v] = await knex('users')
    .insert([testAuthor, testVoter])
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
  return {
    proposalId: prop,
    pollOneId: p1,
    pollTwoId: p2,
    voterId: v,
  };
};

describe('Vote Model', () => {
  beforeEach(() => clearDB());

  describe('Vote.create', () => {
    test('Should allow to vote if conditions are met', async () => {
      const ids = await setup();
      const testActor = createTestActor({
        groups: Groups.VOTER,
        id: ids.voterId,
        canVoteSince: new Date(null),
      });
      const pollOneVoteData = { pollId: ids.pollOneId, position: 1 };
      const pollTwoVoteData = { pollId: ids.pollTwoId, position: 1 };

      const pollOneVoteResult = await Vote.create(
        testActor,
        pollOneVoteData,
        createLoaders(),
      );
      const [updatedPollOneData] = await knex('polls')
        .where({ id: pollOneVoteData.pollId })
        .select('upvotes', 'downvotes');

      expect(pollOneVoteResult).toEqual(
        expect.objectContaining({ position: 'pro' }),
      );
      expect(updatedPollOneData).toEqual({ upvotes: 1, downvotes: 0 });

      const pollTwoVoteResult = await Vote.create(
        testActor,
        pollTwoVoteData,
        createLoaders(),
      );
      const [updatedPollTwoData] = await knex('polls')
        .where({ id: pollTwoVoteData.pollId })
        .select('upvotes', 'downvotes');
      expect(pollTwoVoteResult).toEqual(
        expect.objectContaining({ position: 'pro' }),
      );
      expect(updatedPollTwoData).toEqual({ upvotes: 1, downvotes: 0 });
    });
  });

  describe('Vote.update', () => {
    test('Should allow to update a vote if conditions are met', async () => {
      const ids = await setup();
      const existingPollOneVoteData = {
        poll_id: ids.pollOneId,
        position: 'pro',
        user_id: ids.voterId,
      };
      const existingPollTwoVoteData = {
        poll_id: ids.pollTwoId,
        position: 'pro',
        user_id: ids.voterId,
      };

      const [vp1, vp2] = await knex('votes')
        .insert([existingPollOneVoteData, existingPollTwoVoteData])
        .returning('id');

      expect(vp1).toBeDefined();
      expect(vp2).toBeDefined();
      const testActor = createTestActor({
        groups: Groups.VOTER,
        id: ids.voterId,
        canVoteSince: new Date(null),
      });
      const pollOneVoteData = { id: vp1, pollId: ids.pollOneId, position: 0 };
      const pollTwoVoteData = { id: vp2, pollId: ids.pollTwoId, position: 0 };
      const updatedVoteResultP1 = await Vote.update(
        testActor,
        pollOneVoteData,
        createLoaders(),
      );
      // pollOne cannot be updated
      expect(updatedVoteResultP1).toBeFalsy();

      const updatedVoteResultP2 = await Vote.update(
        testActor,
        pollTwoVoteData,
        createLoaders(),
      );
      expect(updatedVoteResultP2.updatedVote).toEqual(
        expect.objectContaining({ position: 'con' }),
      );
    });
  });

  describe('Vote.delete', () => {
    test('Should delete statement too', async () => {
      const ids = await setup();
      const existingPollOneVoteData = {
        poll_id: ids.pollOneId,
        position: 'pro',
        user_id: ids.voterId,
      };
      const existingPollTwoVoteData = {
        poll_id: ids.pollTwoId,
        position: 'pro',
        user_id: ids.voterId,
      };

      const [vp1, vp2] = await knex('votes')
        .insert([existingPollOneVoteData, existingPollTwoVoteData])
        .returning('id');

      expect(vp1).toBeDefined();
      expect(vp2).toBeDefined();

      const testActor = createTestActor({
        groups: Groups.VOTER,
        id: ids.voterId,
        canVoteSince: new Date(null),
      });
      const pollOneVoteData = { id: vp1, pollId: ids.pollOneId, position: 1 };
      const pollTwoVoteData = { id: vp2, pollId: ids.pollTwoId, position: 1 };

      const statementPollOne = createStatement({
        pollId: ids.pollOneId,
        vote_id: vp1,
        authorId: ids.voterId,
        voteId: vp1,
      });
      const statementPollTwo = createStatement({
        pollId: ids.pollTwoId,
        vote_id: vp2,
        authorId: ids.voterId,
        voteId: vp2,
      });

      const [sp1, sp2] = await knex('statements')
        .insert([statementPollOne, statementPollTwo])
        .returning('id');
      expect(sp1).toBeDefined();
      expect(sp2).toBeDefined();
      const voteDeleteResultP1 = await Vote.delete(
        testActor,
        pollOneVoteData,
        createLoaders(),
      );
      expect(voteDeleteResultP1.deletedStatement).toEqual(
        expect.objectContaining({ id: sp1 }),
      );
      expect(voteDeleteResultP1.deletedVote).toEqual(
        expect.objectContaining({ id: vp1, position: 'pro' }),
      );
      const voteDeleteResultP2 = await Vote.delete(
        testActor,
        pollTwoVoteData,
        createLoaders(),
      );
      expect(voteDeleteResultP2.deletedStatement).toEqual(
        expect.objectContaining({ id: sp2 }),
      );
      expect(voteDeleteResultP2.deletedVote).toEqual(
        expect.objectContaining({ id: vp2, position: 'pro' }),
      );
    });
  });
});
