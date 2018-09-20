import knex from '../knex';
import PollingMode from './PollingMode';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { Groups } from '../../organization';
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}

class Poll {
  constructor(data) {
    this.id = data.id;
    this.pollingModeId = data.polling_mode_id;
    this.secret = data.secret;
    this.threshold = data.threshold;
    this.upvotes = data.upvotes;
    this.downvotes = data.downvotes;
    this.numVoter = data.num_voter;
    this.startTime = data.start_time;
    this.endTime = data.end_time;
    this.closedAt = data.closed_at;
    this.extended = data.extended;
    this.multipeChoice = data.multipe_choice;
    this.options = data.options;
  }

  static async gen(viewer, id, { polls }) {
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
  static async create(viewer, data, loaders) {
    // authorize
    if (!canMutate(viewer, data, Models.POLL)) return null;

    // validate
    if (!data.polling_mode_id) return null;
    if (!data.threshold) return null;
    if (!data.end_time) return null;

    // create
    const newPollId = await knex.transaction(async trx => {
      const pollingMode = await PollingMode.gen(
        viewer,
        data.polling_mode_id,
        loaders,
      );
      if (!pollingMode) throw Error('No valid PollingMode provided');
      let numVoter = 0;

      if (pollingMode.thresholdRef === 'all') {
        // TODO change completely in case of group model
        if (data.workTeamId) {
          numVoter = await knex('user_work_teams')
            .transacting(trx)
            .where({ work_team_id: data.workTeamId })
            .join('users', 'users.id', 'user_work_teams.user_id') // bc also viewers can be members
            .whereRaw('users.groups & ? > 0', [Groups.VIEWER]) // TODO whitelist
            .count('users.id');
        } else {
          numVoter = await trx
            .whereRaw('groups & ? > 0', [Groups.VOTER]) // TODO whitelist
            .count('id')
            .into('users');
        }
        numVoter = Number(numVoter[0].count);
        if (numVoter < 1) throw Error('Not enough user');
      }
      if (data.workTeamId) {
        delete data.workTeamId; // eslint-disable-line
      }
      if ('workTeam' in data) {
        delete data.workTeam; // eslint-disable-line
      }
      const id = await trx
        .insert(
          {
            ...data,
            num_voter: numVoter,
            created_at: new Date(),
          },
          'id',
        )
        .into('polls');
      return id[0];
    });
    if (!newPollId) return null;
    return Poll.gen(viewer, newPollId, loaders) || null;
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
