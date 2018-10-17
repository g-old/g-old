// @flow
import knex from '../knex';
import Poll from './Poll';
/* eslint-disable import/no-cycle */
import WorkTeam from './WorkTeam';
/* eslint-enable import/no-cycle */

import PollingMode from './PollingMode';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { isAdmin, Groups } from '../../organization';
import EventManager from '../../core/EventManager';
import log from '../../logger';
import sanitize from '../../core/htmlSanitizer';
import Statement from './Statement'; // eslint-disable-line import/no-cycle
import { transactify, TargetType } from './utils';
import Tag from './Tag';

type ProposalRowType = $Shape<ProposalProps>;
type ProposalInputArgs = {
  id?: ID,
  poll?: $Shape<PollShape>,
  workTeamId: ID,
  state: ProposalStateType,
};

export const computeNextState = (
  state: ProposalStateType,
  poll: Poll,
  tRef: number,
) => {
  let newState;
  let ref;
  // TODO !! in case of extended
  if (poll.extended) {
    return state;
    // what to do?
    // cases survey: state survey
    // state proposed :  not possible?
    // state voting : state voting : copy wining option as proposal
  }
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

async function closePoll(viewer, id, loaders, trx) {
  const poll = await Poll.gen(viewer, id, loaders);
  if (!poll) {
    throw new Error('Could not load poll');
  }
  if (!poll.closedAt) {
    const updatedPoll = await Poll.update(
      viewer,
      { id, closedAt: new Date() },
      loaders,
      trx,
    );
    if (!updatedPoll) {
      throw new Error('Could not update poll');
    }
  }
}

class StateTransitionHelper {
  viewer: ViewerShape;

  newState: ProposalStateType;

  trx: Transaction;

  poll: Poll;

  loaders: DataLoaders;

  constructor(props) {
    this.viewer = props.viewer;
    this.newState = props.newState;
    this.trx = props.trx;
    this.poll = props.activePoll;
    this.loaders = props.loaders;
  }

  pollIsReady(proposal) {
    return !proposal.deletedAt && !this.poll.closedAt; // active poll must be open
  }

  async checkNextState(proposal, pollingMode) {
    const transitionResult = computeNextState(
      proposal.state,
      this.poll,
      pollingMode.thresholdRef,
    );
    return this.newState === transitionResult;
  }

  async getPollingMode() {
    return PollingMode.gen(
      this.viewer,
      this.poll.pollingModeId,
      this.loaders,
      this.trx,
    );
  }

  async canTransition(proposal) {
    if (this.pollIsReady(proposal)) {
      if (this.newState === 'revoked') {
        return true;
      }
      const pollingMode = await this.getPollingMode(); // $FlowFixMe

      if (!pollingMode) {
        throw new Error('Could not load pollingMode');
      }
      return this.checkNextState(proposal, pollingMode);
    }

    return false;
  }

  async closePoll(pollId) {
    return closePoll(this.viewer, pollId, this.loaders, this.trx);
  }

  async closeOpenPolls(proposal) {
    if (proposal.pollOneId) {
      await this.closePoll(proposal.pollOneId);
    }
    if (proposal.pollTwoId) {
      await this.closePoll(proposal.pollTwoId);
    }
  }

  async createNextPoll(pollData) {
    if (!pollData || !pollData.mode) {
      throw new Error('Poll data is missing');
    }
    const pollingMode = await PollingMode.createOrGet(
      this.viewer,
      pollData.mode,
      this.loaders,
      this.trx,
    );
    if (!pollingMode) throw Error('PollingMode failed');
    const newPoll = await Poll.create(
      this.viewer,
      pollData,
      this.loaders,
      this.trx,
    );
    if (!newPoll) {
      throw new Error('Could not create poll');
    }
    return newPoll;
  }
}

class Proposal {
  id: ID;

  state: ProposalStateType;

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

  updatedAt: ?string;

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
    this.updatedAt = data.updated_at;
  }

  async getActivePoll(viewer: ViewerShape, loaders) {
    const poll = await Poll.gen(
      viewer,
      this.pollTwoId || this.pollOneId,
      loaders,
    );
    if (poll) {
      return poll;
    }
    throw new Error(`Could not load poll: ${poll.id}`);
  }

  static async gen(
    viewer: ViewerShape,
    id: ID,
    { proposals }: { proposals: DataLoader<ID, ProposalProps> },
  ) {
    const data = await proposals.load(id);
    if (data == null) return null;
    const result = new Proposal(data); // for isMember check in accessControl;
    if (!canSee(viewer, result, Models.PROPOSAL)) return null;
    return result;
    // return canSee ? new Proposal(data) : new Proposal(data.email = null);
  }

  static async genByPoll(viewer: ViewerShape, pollId: ID, { proposalsByPoll }) {
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

  isNewPollRequired(newState: ProposalStateType) {
    return (
      this.state === 'proposed' &&
      this.pollOneId &&
      newState === 'voting' &&
      !this.pollTwoId
    );
  }

  isSurveyAndShouldClose(pollData) {
    return pollData && pollData.closedAt && this.state === 'survey';
  }

  // TODO make member method
  static async update(
    viewer: ViewerShape,
    data: ProposalInputArgs,
    loaders: DataLoaders,
  ) {
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

    const newValues: ProposalRowType = { updated_at: new Date() };

    const [updatedProposal = null] = await knex.transaction(async trx => {
      const activePoll = await proposalInDB.getActivePoll(viewer, loaders);
      if (!activePoll) {
        throw new Error('Could no load poll');
      }
      if (data.state) {
        const helper = new StateTransitionHelper({
          viewer,
          newState: data.state,
          trx,
          loaders,
          activePoll,
        });
        if (helper.canTransition(proposalInDB)) {
          await helper.closeOpenPolls(proposalInDB);

          if (proposalInDB.isNewPollRequired(data.state)) {
            const pollTwo = await helper.createNextPoll(data.poll);
            newValues.poll_two_id = pollTwo.id;
          }

          newValues.state = data.state;
        } else {
          throw new Error(
            `State transition not allowed from ${proposalInDB.state} to ${
              data.state
            }`,
          );
        }
      }

      if (proposalInDB.isSurveyAndShouldClose(data.poll)) {
        await closePoll(viewer, activePoll.id, loaders, trx);
      }

      return knex('proposals')
        .transacting(trx)
        .where({
          id: data.id,
        })
        .update(newValues)
        .returning('*');
    });

    const proposal = updatedProposal && new Proposal(updatedProposal);
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
    const newData = { created_at: new Date(), author_id: viewer.id };

    if (data.title) {
      newData.title = data.title;
    }

    if (data.text) {
      newData.body = sanitize(data.text);
    }

    if (data.workTeamId) {
      newData.work_team_id = data.workTeamId;
    }

    if (data.spokesmanId) {
      newData.spokesman_id = data.spokesmanId;
    }
    if (data.state) {
      if (!['survey', 'proposed', 'voting'].includes(data.state)) {
        throw new Error(`Wrong state provided: ${data.state}`);
      }
      newData.state = data.state;
    }

    const proposalData = await knex.transaction(async trx => {
      const pollingMode = await PollingMode.createOrGet(
        viewer,
        data.poll.mode,
        loaders,
        trx,
      );

      if (!pollingMode) throw Error('PollingMode failed');

      const pollOne = await Poll.create(
        viewer,
        {
          ...data.poll,
          pollingModeId: pollingMode.id,
          workTeamId: data.workTeamId,
        },
        loaders,
        trx,
      );
      if (!pollOne) throw Error('No pollOne provided');
      newData.poll_one_id = pollOne.id;

      const [proposal = null] = await knex('proposals')
        .transacting(trx)
        .insert(newData)
        .returning('*');

      if (proposal) {
        if (data.tags) {
          await Tag.addTagsToProposal(
            viewer,
            { proposal, tags: data.tags },
            trx,
          );
        }

        if (data.workTeamId) {
          await knex('work_teams')
            .transacting(trx)
            .forUpdate()
            .where({ id: data.workTeamId })
            .increment('num_proposals', 1);
        }
      }

      return proposal;
    });

    const proposal = proposalData && new Proposal(proposalData);

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
