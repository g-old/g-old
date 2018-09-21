// @flow
import knex from '../knex';
import Poll from './Poll';
import User from './User';
/* eslint-disable import/no-cycle */
import WorkTeam from './WorkTeam';
/* eslint-enable import/no-cycle */

import PollingMode from './PollingMode';
import { dedup } from '../../core/helpers';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { isAdmin, Groups } from '../../organization';
import EventManager from '../../core/EventManager';
import log from '../../logger';
import sanitize from '../../core/htmlSanitizer';
import Statement from './Statement'; // eslint-disable-line import/no-cycle
import { transactify, TargetType } from './utils';

type ID = string | number;
type ProposalState = 'accepted' | 'rejected' | 'revoked' | 'survey';
export type ProposalProps = {
  id: ID,
  author_id: ID,
  title: string,
  body: string,
  votes: number,
  poll_one_id: ID,
  poll_two_id: ID,
  state: ProposalState,
  created_at: string,
  spokesman_id: ID,
  notified_at: string,
  work_team_id: ID,
  deleted_at: ?string,
};

export const computeNextState = (state: ProposalState, poll, tRef: number) => {
  let newState;
  let ref;

  switch (tRef) {
    case 'voters':
      ref = poll.options[0].numVotes + poll.options[1].numVotes;
      break;
    case 'all':
      ref = poll.numVoter;
      break;

    default:
      throw Error(`Threshold reference not implemented: ${tRef}`);
  }

  ref *= poll.threshold / 100;

  if (poll.options[0].numVotes >= ref) {
    switch (state) {
      case 'proposed': {
        newState = 'proposed';
        break;
      }
      case 'voting': {
        newState = 'accepted';
        break;
      }
      case 'survey': {
        newState = 'survey';
        break;
      }

      default:
        throw Error(`State not recognized: ${state}`);
    }
  } else {
    switch (state) {
      case 'proposed': {
        newState = 'accepted';
        break;
      }
      case 'voting': {
        newState = 'rejected';
        break;
      }
      case 'survey': {
        newState = 'survey';
        break;
      }

      default:
        throw Error(`State not recognized: ${state}`);
    }
  }

  return newState;
};

const validateTags = async tags => {
  let existingTags;
  let newTags;
  // max tags
  if (!tags || tags.length > 8) return {};
  existingTags = tags.filter(tag => 'id' in tag);
  newTags = tags.filter(tag => 'text' in tag);

  // check if new tags don't already exist
  const queries = newTags.map(tag =>
    knex('tags')
      .where('text', 'ilike', tag.text)
      .select(),
  );

  let duplicates = await Promise.all(queries);
  duplicates = duplicates.reduce((acc, curr) => acc.concat(curr), []);
  duplicates.forEach(dup => {
    if (dup.id) {
      existingTags.push(dup);
      newTags = newTags.filter(
        t => t.text.toLowerCase() !== dup.text.toLowerCase(),
      );
    }
  });

  // deduplicate
  existingTags = dedup(existingTags);
  newTags = dedup(newTags);
  return { existingTags, newTags };
};

const validateDates = ({ poll }) => {
  const serverTime = new Date();
  const startTime =
    poll && poll.startTime ? new Date(poll.startTime) : serverTime;
  if (!startTime.getMonth || typeof startTime.getMonth !== 'function')
    return null;

  let endTime;
  if (poll && poll.endTime) {
    endTime = new Date(poll.endTime);
  } else {
    endTime = new Date();
    endTime.setDate(startTime.getDate() + 3);
  }
  if (!endTime.getMonth || typeof endTime.getMonth !== 'function') return null;
  if (startTime < serverTime || startTime >= endTime)
    throw Error('DateTime wrong');
  return { startTime, endTime };
};

// TODO  implement this  in Poll create instead
const validatePoll = async (viewer, poll, loaders) => {
  if (!poll) return {};
  let pollingMode;
  let createPollingMode = false;
  let pollingModeData;
  let isSurvey = false;
  if (poll.mode && poll.mode.id) {
    pollingMode = await PollingMode.gen(viewer, poll.mode.id, loaders);

    if (!pollingMode) throw Error('PollingMode not found');
    // check if modifications
    const { id, ...properties } = poll.mode;
    const keys = Object.keys(properties);
    if (keys.length > 0) {
      // check if values are different
      const diff = keys.reduce((acc, curr) => {
        if (properties[curr] !== pollingMode[curr]) {
          // eslint-disable-next-line no-param-reassign
          acc += 1;
        }
        return acc;
      }, 0);
      createPollingMode = diff > 0;
      pollingModeData = { ...pollingMode, ...properties };
      if (pollingMode.name === 'survey') {
        isSurvey = true;
        pollingModeData.thresholdRef = 'voters';
      }
    }
  }
  const { startTime, endTime } = validateDates({ poll });
  let { threshold } = poll;
  if (isSurvey) {
    threshold = 100;
  }
  const pollData = {
    secret: poll.secret || false,
    start_time: startTime,
    end_time: endTime,
    threshold: threshold || 50,
    ...(poll.workTeamId && { workTeamId: poll.workTeamId }),
  };

  return { pollData, pollingModeData, createPollingMode };
};

const validateStateChange = async (
  viewer,
  { state, proposalInDB },
  loaders,
) => {
  const pollId =
    proposalInDB.state === 'proposed' || proposalInDB.state === 'survey'
      ? proposalInDB.pollOneId
      : proposalInDB.pollTwoId;
  const pollInDB = await Poll.gen(viewer, pollId, loaders);
  if (pollInDB.closedAt) return false; // Dont allow alteration after closing;
  if (state === 'revoked') return true; // Proposals can be revoked at any time
  if (state !== 'voting') {
    // check times
    // poll mast have been ended!
    if (new Date(pollInDB.end_time) > new Date()) return false;
  }
  const pollingModeinDB = await PollingMode.gen(
    viewer,
    pollInDB.pollingModeId,
    loaders,
  );
  if (!pollingModeinDB) throw Error('PollingMode not found');
  if (
    state !==
    computeNextState(proposalInDB.state, pollInDB, pollingModeinDB.thresholdRef)
  ) {
    return false;
  }
  return true;
};

class Proposal {
  id: ID;

  state: ProposalState;

  authorId: ID;

  body: string;

  title: string;

  votes: number;

  pollOneId: ID;

  pollTwoId: ID;

  createdAt: string;

  spokesmanId: ID;

  notifiedAt: string;

  workTeamId: ID;

  deletedAt: ?string;

  constructor(data: ProposalProps) {
    this.id = data.id;
    this.authorId = data.author_id;
    this.title = data.title;
    this.body = data.body;
    this.votes = data.votes;
    this.pollOneId = data.poll_one_id;
    this.pollTwoId = data.poll_two_id;
    this.state = data.state;
    this.createdAt = data.created_at;
    this.spokesmanId = data.spokesman_id;
    this.notifiedAt = data.notified_at;
    this.workTeamId = data.work_team_id;
    this.deletedAt = data.deleted_at;
  }

  static async gen(viewer, id, { proposals }) {
    const data = await proposals.load(id);
    if (data == null) return null;
    const result = new Proposal(data); // for isMember check in accessControl;
    if (!canSee(viewer, result, Models.PROPOSAL)) return null;
    return result;
    // return canSee ? new Proposal(data) : new Proposal(data.email = null);
  }

  static async genByPoll(viewer, pollId, { proposalsByPoll }) {
    const data = await proposalsByPoll.load(pollId);
    if (!data) return null;
    const result = new Proposal(data); // for isMember check in accessControl;
    if (!canSee(viewer, result, Models.PROPOSAL)) return null;
    return result;
  }

  static async followees(id, { followees }) {
    const data = await followees.load(id);
    return data;
    /*  return Promise.resolve(knex('user_follows')
    .where({ follower_id: id }).pluck('followee_id')
    .then(ids => {return ids; }));
      */
  }

  // TODO make member method
  static async update(viewer, data, loaders) {
    // throw Error('TESTERROR');
    if (!data || !data.id) return null;
    const proposalInDB = await Proposal.gen(viewer, data.id, loaders);
    if (!proposalInDB) return null;
    let workTeam;
    if (proposalInDB.workTeamId) {
      workTeam = await WorkTeam.gen(viewer, proposalInDB.workTeamId, loaders);
    }

    // authorize
    if (!canMutate(viewer, { ...data, workTeam }, Models.PROPOSAL)) return null;
    // validate
    // if (data.state && ['revoked', 'accepted'].indexOf(data.state) === -1) return null;
    const { pollData, pollingModeData, createPollingMode } = await validatePoll(
      viewer,
      data.poll,
      loaders,
    );

    const newValues = { state: 'voting', updated_at: new Date() };

    // update
    if (data.state) {
      const isValid = await validateStateChange(
        viewer,
        { state: data.state, proposalInDB },
        loaders,
      );
      if (isValid) {
        newValues.state = data.state;
      } else {
        throw Error('State transition not allowed');
      }
    }
    const proposalId = await knex.transaction(async trx => {
      if (pollData) {
        // create poll
        let pId = data.poll.mode.id;
        // TODO check if they get reverted in case of rollback
        if (createPollingMode && pollingModeData) {
          const pMode = await PollingMode.create(
            viewer,
            pollingModeData,
            loaders,
          );
          if (!pMode) throw Error('PollingMode failed');
          pId = pMode.id;
        }

        const pollTwoData = {
          polling_mode_id: pId,
          ...pollData,
        };
        const pollTwo = await Poll.create(
          viewer,
          { ...pollTwoData, workTeam },
          loaders,
        );
        if (!pollTwo) throw Error('No pollTwo provided');
        // update/close pollOne
        // TODO check first if not already closed?
        const pollOne = await Poll.update(
          viewer,
          { id: proposalInDB.pollOneId, closedAt: new Date(), workTeam },
          loaders,
        );
        if (!pollOne) throw Error('No pollOne provided');
        newValues.poll_two_id = pollTwo.id;
      }
      if (newValues.state && newValues.state !== 'voting') {
        const pollId =
          proposalInDB.state === 'proposed' || proposalInDB.state === 'survey'
            ? proposalInDB.pollOneId
            : proposalInDB.pollTwoId;
        await trx
          .where({ id: pollId })
          .update({ closed_at: new Date(), updated_at: new Date() })
          .into('polls');
        loaders.polls.clear(pollId);
      }

      await trx
        .where({
          id: data.id,
        })
        .update({
          ...newValues,
        })
        .into('proposals');
      return data.id;
    });

    if (!proposalId) return null;
    loaders.proposals.clear(proposalId);

    const proposal = await Proposal.gen(viewer, proposalId, loaders);
    if (proposal) {
      EventManager.publish('onProposalUpdated', {
        viewer,
        proposal,
        ...(newValues.state && { info: { newState: newValues.state } }),
        ...(data.workTeamId && { groupId: data.workTeamId }),
        subjectId: data.workTeamId,
      });
    }
    return proposal;
  }

  static async create(viewer, data, loaders) {
    if (!data || !data.text || !data.title) return null;
    // throw Error('TestError');
    // authorize
    let workTeam;
    if (data.workTeamId) {
      workTeam = await WorkTeam.gen(viewer, data.workTeamId, loaders);
    }
    if (!canMutate(viewer, { ...data, workTeam }, Models.PROPOSAL)) return null;
    // validate
    const { pollData, pollingModeData, createPollingMode } = await validatePoll(
      viewer,
      { ...data.poll, ...(data.workTeamId && { workTeamId: data.workTeamId }) },
      loaders,
    );
    const additionalData = {};
    if (data.spokesmanId) {
      const spokesman = await User.gen(viewer, data.spokesmanId, loaders);
      if (spokesman) {
        additionalData.spokesman_id = spokesman.id;
      }
    }

    // tags
    const { existingTags, newTags } = await validateTags(data.tags);

    const newProposalId = await knex.transaction(async trx => {
      let pId = data.poll.mode.id;
      // TODO check if they get reverted in case of rollback
      if (createPollingMode && pollingModeData) {
        const pMode = await PollingMode.create(
          viewer,
          pollingModeData,
          loaders,
        );
        if (!pMode) throw Error('PollingMode failed');
        pId = pMode.id;
      }

      const pollOneData = {
        polling_mode_id: pId,
        ...pollData,
      };
      const pollOne = await Poll.create(
        viewer,
        { ...pollOneData, workTeam },
        loaders,
      );
      if (!pollOne) throw Error('No pollOne provided');

      if (!['survey', 'proposed', 'voting'].includes(data.state)) {
        throw new Error('State is missing');
      }
      const { state } = data;

      const pollField = state === 'voting' ? 'poll_two_id' : 'poll_one_id';
      const [id = null] = await trx
        .insert(
          {
            author_id: viewer.id,
            title: data.title,
            body: sanitize(data.text),
            [pollField]: pollOne.id,
            ...(data.workTeamId && { work_team_id: data.workTeamId }),
            state,
            ...additionalData,
            created_at: new Date(),
          },
          'id',
        )
        .into('proposals');

      // tags
      if (existingTags && existingTags.length) {
        await trx
          .insert(existingTags.map(t => ({ proposal_id: id, tag_id: t.id })))
          .into('proposal_tags');

        // update counts
        await Promise.all(
          existingTags.map(t =>
            trx
              .where({ id: t.id })
              .increment('count', 1)
              .into('tags'),
          ),
        );
      }

      if (newTags && newTags.length) {
        const ids = await trx
          .insert(newTags.map(t => ({ text: t.text, count: 1 })))
          .into('tags')
          .returning('id');
        await Promise.all(
          ids.map(tId =>
            trx.insert({ proposal_id: id, tag_id: tId }).into('proposal_tags'),
          ),
        );
        //
      }

      if (data.workTeamId) {
        await knex('work_teams')
          .where({ id: data.workTeamId })
          .increment('num_proposals', 1);
      }
      return id;
    });

    if (!newProposalId) return null;
    const proposal = await Proposal.gen(viewer, newProposalId, loaders);

    if (proposal) {
      EventManager.publish('onProposalCreated', {
        viewer,
        proposal,
        ...(data.workTeamId && { groupId: data.workTeamId }),
        subjectId: data.workTeamId,
      });
    }
    return proposal;
  }

  static async toggleStatus(viewer, data, loaders, trx) {
    if (!data || !data.id) return null;

    if (!isAdmin(viewer)) {
      throw new Error('Permission denied');
    }

    const toggle = async transaction => {
      const proposalInDB = await Proposal.gen(viewer, data.id, loaders);
      if (proposalInDB) {
        const now = new Date();
        const pollIds = [];
        if (proposalInDB.pollOneId) {
          pollIds.push(proposalInDB.pollOneId);
        }
        if (proposalInDB.pollTwoId) {
          pollIds.push(proposalInDB.pollTwoId);
        }
        if (pollIds.length) {
          await knex('polls')
            .transacting(transaction)
            .whereIn('id', pollIds)
            .update({ deleted_at: data.value, updated_at: now });
        }
        return knex('proposals')
          .transacting(transaction)
          .where({ id: data.id })
          .update({ deleted_at: data.value, updated_at: now })
          .returning('*');
      }
      return proposalInDB;
    };

    const updatedProposal = await transactify(toggle, knex, trx);

    return updatedProposal ? new Proposal(updatedProposal) : null;
  }

  static async delete(viewer, data, loaders, trx) {
    if (!data || !data.id) return null;

    if (!isAdmin(viewer)) {
      throw new Error('Permission denied');
    }

    const deleteProposal = async transaction => {
      const proposalInDB = await Proposal.gen(viewer, data.id, loaders);
      if (proposalInDB) {
        if (!proposalInDB.deletedAt) {
          throw new Error('Soft-deletion missing');
        }
        // for both polls

        const statementsData = await knex('statements')
          .where({ poll_id: proposalInDB.pollOneId })
          .orWhere({ poll_id: proposalInDB.pollTwoId })
          .select(['id', 'poll_id', 'likes', 'author_id']); // return user_id if we want to correct stmt counters on user

        if (statementsData.length) {
          if (data.isCascading) {
            // means deletion was initiated from wt -> we don't care about activities
            await knex('statements')
              .transacting(transaction)
              .forUpdate()
              .whereIn('id', statementsData.map(d => d.id))
              .del();
            // likes and statementcounters are counted live atm - no need to correct them
            // const summed = groupAndSumBy(statementsData,'author_id', 'likes');
          } else {
            // activities are created for not messing up the feed
            const statementDeletePromises = statementsData.map(sData =>
              Statement.delete(
                viewer,
                { id: sData.id, pollId: sData.poll_id },
                loaders,
              ),
            );
            await Promise.all(statementDeletePromises);
          }

          // no FK present
          await knex('flagged_statements')
            .transacting(transaction)
            .forUpdate()
            .whereIn('statement_id', statementsData.map(s => s.id))
            .del();
        }
        // proposal_groups is deleted via on delete trigger

        // delete subscriptions
        await knex('subscriptions')
          .transacting(transaction)
          .forUpdate()
          .where({ target_type: TargetType.PROPOSAL, target_id: data.id })
          .del();

        await knex('proposals')
          .transacting(transaction)
          .forUpdate()
          .where({ id: data.id })
          .del();

        // decrement counters
        if (proposalInDB.workTeamId) {
          await knex('work_teams')
            .transacting(transaction)
            .forUpdate()
            .where({ id: proposalInDB.workTeamId })
            .decrement('num_proposals', 1);
        }
      }
      return proposalInDB;
    };

    return transactify(deleteProposal, knex, trx);
  }

  async isVotable(viewer) {
    if (['proposed', 'voting', 'survey'].indexOf(this.state) !== -1 && viewer) {
      // eslint-disable-next-line no-bitwise
      if (this.workTeamId && viewer.groups & Groups.VIEWER) {
        // TODO try to find a better way since it cannot be cached easily and voting isF common
        const [data = null] = await knex('user_work_teams')
          .where({ user_id: viewer.id, work_team_id: this.workTeamId })
          .select('created_at');

        if (data && data.created_at) {
          return new Date(data.created_at) < new Date(this.createdAt);
        }
        return false;
      }
      if (
        this.state === 'survey' ||
        (viewer.canVoteSince &&
          new Date(viewer.canVoteSince) < new Date(this.createdAt))
      ) {
        return true;
      }
    }
    return false;
  }
}

export default Proposal;

const makeVisibleForMainteam = async proposal => {
  try {
    if (!proposal) {
      throw new Error('Proposal not existing');
    }
    if (proposal.workTeamId) {
      const [mainId = null] = await knex('work_teams')
        .where({ main: true })
        .pluck('id');

      if (mainId) {
        // eslint-disable-next-line eqeqeq
        if (mainId == proposal.workTeamId) {
          return Promise.resolve();
        }
        return knex('proposal_groups').insert({
          group_id: mainId,
          group_type: 'WT',
          state: 'WAITING',
          proposal_id: proposal.id,
          created_at: new Date(),
        });
      }
    }
  } catch (err) {
    log.error(
      { err, proposalId: proposal.id, proposalState: proposal.state },
      'Could not add proposal to mainTeam',
    );
  }

  return Promise.resolve();
};

EventManager.subscribe('onProposalUpdated', async ({ proposal }) => {
  // Unsub all subscriptions when proposal ended
  if (['accepted', 'rejected', 'revoked'].includes(proposal.state)) {
    try {
      await knex('subscriptions')
        .where({ target_type: TargetType.PROPOSAL, target_id: proposal.id })
        .del();
    } catch (err) {
      log.error({ err }, 'Subscription deletion failed');
    }
  }
  if (['accepted'].includes(proposal.state)) {
    await makeVisibleForMainteam(proposal);
  }
});
