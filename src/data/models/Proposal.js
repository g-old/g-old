// @flow
import knex from '../knex';
import Poll from './Poll';
import User from './User';
import PollingMode from './PollingMode';
import Phase, { PhaseState } from './Phase';
import { dedup } from '../../core/helpers';
import { computeNextState } from '../../core/worker';
import {
  canSee,
  canMutate,
  Models,
  PermissionError,
} from '../../core/accessControl';
import EventManager from '../../core/EventManager';
import type { PollInput } from './Poll';
import log from '../../logger';
import { ValidationError } from '../../core/utils';

type ID = number | string;
type ProposalState =
  | 'proposed'
  | 'voting'
  | 'accepted'
  | 'rejected'
  | 'revoked'
  | 'deleted'
  | 'survey';

type MutationResult = {
  errors?: $ReadOnlyArray<Class<Error>>,
  data?: Proposal, // eslint-disable-line
};

type ProposalInput = {
  id?: ID,
  poll?: PollInput,
};

const extractTextSummary = (string: string) =>
  string.replace(/<\/?[^>]+>/gi, ' ');

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

const validateDates = (poll: PollInput) => {
  const serverTime = new Date();
  let startTime =
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
  if (startTime < serverTime) {
    startTime = serverTime;
  }
  if (startTime >= endTime) {
    return null;
  }
  return { startTime, endTime };
};

// TODO  implement this  in Poll create instead
const validatePoll = async (viewer, poll: PollInput, loaders) => {
  if (!poll) return {};
  let pollingMode;
  let createPollingMode = false;
  const isSurvey = false;
  if (poll.pollingModeId) {
    // use this pollingmode
    pollingMode = await PollingMode.gen(viewer, poll.pollingModeId, loaders);

    if (!pollingMode) {
      throw new ValidationError({
        fields: ['pollingModeId'],
        model: Models.PROPOSAL,
      });
    }
  } else {
    // create a new one
    createPollingMode = true;
  }

  const validDates = validateDates({ poll });
  if (!validDates) {
    throw new ValidationError({
      fields: ['endTime', 'startTime'],
      model: Models.PROPOSAL,
    });
  }
  let { threshold } = poll;
  if (isSurvey) {
    threshold = 100;
  }
  const pollData: PollInput = {
    ...poll,
    startTime: validDates.startTime.toDateString(),
    endTime: validDates.endTime.toDateString(),
    threshold: threshold || 50,
  };

  return { pollData, createPollingMode };
};

const validateStateChange = async (
  viewer,
  { state, proposalInDB },
  loaders,
) => {
  const pollId =
    proposalInDB.state === 'proposed' || proposalInDB.state === 'survey'
      ? proposalInDB.pollOne_id
      : proposalInDB.pollTwo_id;
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

const checkIfCoordinator = async (viewer, data) => {
  if (data.workTeamId) {
    const [coordinatorId] = await knex('work_teams')
      .where({ id: data.workTeamId })
      .pluck('coordinator_id');
    // eslint-disable-next-line
    return coordinatorId && coordinatorId == viewer.id;
  }
  return false;
};

class Proposal {
  id: ID;
  authorId: ID;
  title: string;
  text: string;
  textHtml: string;
  currentPhaseId: ID;
  state: ProposalState;
  votes: number;
  spokesmanId: ID;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;

  constructor(data) {
    this.id = data.id;
    this.authorId = data.author_id;
    this.title = data.title;
    this.text = data.text;
    this.textHtml = data.text_html;
    this.spokesmanId = data.spokesman_id;
    this.votes = data.votes;
    this.state = data.state;
    this.createdAt = data.created_at;
    this.spokesmanId = data.spokesman_id;
    this.updatedAt = data.updated_at;
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
    /*  const data = await knex('proposals')
      .where({ poll_one_id: pollId })
      .orWhere({ poll_two_id: pollId })
      .select(); */

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
    const isCoordinator = await checkIfCoordinator(viewer, data);

    // authorize
    if (!canMutate(viewer, { ...data, isCoordinator }, Models.PROPOSAL))
      return null;
    // validate
    if (!data.id) return null;
    const proposalInDB = await Proposal.gen(viewer, data.id, loaders);
    if (!proposalInDB) return null;
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
          { ...pollTwoData, isCoordinator },
          loaders,
        );
        if (!pollTwo) throw Error('No pollTwo provided');
        // update/close pollOne
        // TODO check first if not already closed?
        const pollOne = await Poll.update(
          viewer,
          { id: proposalInDB.pollOne_id, closedAt: new Date(), isCoordinator },
          loaders,
        );
        if (!pollOne) throw Error('No pollOne provided');
        newValues.poll_two_id = pollTwo.id;
      }
      if (newValues.state && newValues.state !== 'voting') {
        const pollId =
          proposalInDB.state === 'proposed' || proposalInDB.state === 'survey'
            ? proposalInDB.pollOne_id
            : proposalInDB.pollTwo_id;
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
      EventManager.publish('onProposalUpdated', { viewer, proposal });
    }
    return proposal;
  }

  static async create(viewer, data: ProposalInput, loaders): MutationResult {
    // throw Error('TestError');
    // authorize
    if (!canMutate(viewer, { ...data }, Models.PROPOSAL)) {
      throw new PermissionError({ viewer, data, model: Models.PROPOSAL });
    }

    // validate
    if (!data.text) return null;
    if (!data.title) return null;
    const { pollData, createPollingMode } = await validatePoll(
      viewer,
      { ...data.poll, ...(data.groupId && { groupId: data.groupId }) },
      loaders,
    );

    const newValues = { created_at: new Date() };
    if (data.spokesmanId) {
      const spokesman = await User.gen(viewer, data.spokesmanId, loaders);
      if (spokesman) {
        newValues.spokesman_id = spokesman.id;
      }
    }
    if (data.textHtml) {
      newValues.text_html = data.textHtml;
      newValues.text = extractTextSummary(data.textHtml);
    }
    if (data.title) {
      newValues.title = data.title;
    }

    // tags
    const { existingTags, newTags } = await validateTags(data.tags);
    const newProposal = await knex.transaction(async trx => {
      // eslint-disable-next-line
      let pId = data.poll.mode.id;
      // TODO check if they get reverted in case of rollback
      if (createPollingMode) {
        const pMode = await PollingMode.create(viewer, loaders);
        if (!pMode) throw Error('PollingMode failed');
        pId = pMode.id;
      }

      // TODO further

      const [proposal] = await knex('proposals')
        .transacting(trx)
        .insert(newValues)
        .returning('*');

      // tags
      if (existingTags && existingTags.length) {
        await trx
          .insert(
            existingTags.map(t => ({ proposal_id: proposal.id, tag_id: t.id })),
          )
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
            trx
              .insert({ proposal_id: proposal.id, tag_id: tId })
              .into('proposal_tags'),
          ),
        );
        //
      }

      // create initial phase

      const initialPhase = await Phase.create(
        viewer,
        {
          proposalId: proposal.id,
          createdAt: new Date().toDateString(),
          state: PhaseState.active,
        },
        trx,
      );

      const poll = await Poll.create(
        viewer,
        { phase_id: initialPhase.id, group_id: data.groupId, ...pollData },
        loaders,
      );
      if (!poll) {
        throw new Error('TO IMPLEMENT CHECK');
      }

      // is nextGroupId

      return proposal.id;
    });

    if (!newProposal) return null;
    const proposal = await Proposal.gen(viewer, newProposal, loaders);

    if (proposal) {
      EventManager.publish('onProposalCreated', {
        viewer,
        proposal,
        ...(data.groupId && { groupId: data.groupId }),
      });
    }
    return proposal;
  }

  async subscribe(viewer) {
    if (['accepted, revoked, rejected'].indexOf(this.state) !== -1) return null;

    const [sId = null] = await knex('proposal_user_subscriptions')
      .insert({ proposal_id: this.id, user_id: viewer.id })
      .returning('id');
    return sId || null;
  }

  async unSubscribe(viewer) {
    return knex('proposal_user_subscriptions')
      .where({ proposal_id: this.id, user_id: viewer.id })
      .del();
  }

  async isVotable(viewer) {
    if (['proposed', 'voting', 'survey'].indexOf(this.state) !== -1 && viewer) {
      if (this.groupId) {
        // TODO try to find a better way since it cannot be cached easily and voting isF common
        const [data = null] = await knex('user_groups')
          .where({ user_id: viewer.id, group_id: this.groupId })
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

// Unsub all subscriptions when proposal ended
EventManager.subscribe('onProposalUpdated', async ({ proposal }) => {
  if (['accepted', 'rejected', 'revoked'].includes(proposal.state)) {
    try {
      await knex('proposal_user_subscriptions')
        .where({ proposal_id: proposal.id })
        .del();
    } catch (err) {
      log.error({ err }, 'Subscription deletion failed');
    }
  }
});
