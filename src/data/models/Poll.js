// @flow
import knex from '../knex';
import PollingMode from './PollingMode';
import {
  canSee,
  canMutate,
  Models,
  PermissionError,
} from '../../core/accessControl';
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}
type ID = string | number;

type PollProps = {
  id: ID,
  group_id: ID,
  phase_id: ID,
  polling_mode_id: ID,
  threshold: number,
  start_time: string,
  end_time: string,
  num_voter: number,
  votes_cache: Array<number>,
  created_at: string,
  updated_at?: string,
  closed_at?: string,
  secret?: boolean,
};

export type PollInput = {
  id?: ID,
  pollingModeId?: ID,
  groupId?: ID,
  phaseId?: ID,
  secret?: boolean,
  threshold?: number,
  startTime?: string,
  endTime?: string,
  threshold?: number,
  numVoter?: number,
  votesCache?: Array<number>,
};

class Poll {
  id: ID;
  pollingModeId: ID;
  groupId: ID;
  phaseId: ID;
  secret: boolean;
  threshold: number;
  startTime: string;
  endTime: string;
  threshold: number;
  numVoter: number;
  votesCache: Array<number>;
  createdAt: string;
  updatedAt: string;
  closedAt: string;

  constructor(data: PollProps) {
    this.id = data.id;
    this.phaseId = data.phase_id;
    this.groupId = data.group_id;
    this.pollingModeId = data.polling_mode_id;
    this.secret = data.secret || false;
    this.threshold = data.threshold;
    this.votesCache = data.votes_cache;
    this.numVoter = data.num_voter;
    this.startTime = data.start_time;
    this.endTime = data.end_time;
    this.closedAt = data.closed_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }
  static async gen(viewer, id: ID, { polls }): Promise<?Poll> {
    if (!id) return null;
    const data = await polls.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.POLL) ? new Poll(data) : null;
  }

  // eslint-disable-next-line class-methods-use-this
  isVotable() {
    if (this.closedAt || new Date(this.endTime) < new Date()) {
      return false;
    }
    // TODO regional voting here
    return true;
  }

  async isUnipolar(viewer, loaders) {
    const mode = await PollingMode.gen(viewer, this.pollingModeId, loaders);
    return mode.unipolar === true;
  }
  async isCommentable(viewer, loaders) {
    if (this.closedAt) return false;
    const mode = await PollingMode.gen(viewer, this.pollingModeId, loaders);
    return mode.withStatements === true;
  }
  /* eslint-disable class-methods-use-this */
  // eslint-disable-next-line no-unused-vars
  async validate(viewer) {
    // TODO
    return true;
  }
  /* eslint-enable class-methods-use-this */
  static async create(viewer, data: PollInput, loaders): Promise<Poll> {
    // authorize

    if (!canMutate(viewer, data, Models.POLL)) {
      throw new PermissionError({ viewer, data, model: Models.POLL });
    }
    // create
    const newPoll = await knex.transaction(async trx => {
      let pollingMode;
      if (data.pollingModeId) {
        pollingMode = await PollingMode.gen(
          viewer,
          data.pollingModeId,
          loaders,
        );
      }
      if (!pollingMode) throw Error('No valid PollingMode provided');
      let numVoter = 0;

      if (pollingMode.thresholdRef === 'all') {
        // TODO change completely in case of group model

        // SELECT * FROM reports WHERE data->'objects' @> '[{"src":"foo.png"}]';
        // TODO canvotesince check !!!!
        numVoter = await knex('user_groups')
          .transacting(trx)
          .where({ group_id: data.groupId })
          .whereRaw("rights->'vote' @> '[?]'", ['proposal'])
          .count('id');

        numVoter = Number(numVoter[0].count);
        if (numVoter < 1) throw Error('Not enough user');
      }
      const newValues = {
        group_id: data.groupId,
        phase_id: data.phaseId,
        polling_mode_id: pollingMode.id,
        end_time: data.endTime,
        ...(data.startTime && { start_time: data.startTime }),
        secret: data.secret,
        threshold: data.threshold,
        num_voter: numVoter,
        created_at: new Date().toDateString(),
      };

      const [poll] = await knex('polls')
        .insert(newValues)
        .returning('*');
      return poll;
    });
    return new Poll(newPoll);
  }

  static async update(viewer, data, loaders) {
    // authorize
    if (!canMutate(viewer, data, Models.POLL)) return null;
    // validate
    if (!data.id) return null;
    const newData = {};
    if (data.closedAt) {
      newData.closed_at = data.closedAt;
    }

    const pollId = await knex.transaction(async trx => {
      await trx
        .where({ id: data.id })
        .update({
          ...newData,
          updated_at: new Date(),
        })
        .into('polls');
      return data.id;
    });
    if (!pollId) return null;
    loaders.polls.clear(pollId);
    return Poll.gen(viewer, pollId, loaders);
  }
}

export default Poll;
