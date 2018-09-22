import knex from '../knex';
import PollingMode from './PollingMode';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { Groups } from '../../organization';
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}

const MAX_DESCRIPTION_LENGTH = 10000;

const checkOption = (option, counters) => {
  const validated = {};
  if ('pos' in option) {
    // check uniqness of pos
    if (
      option.pos > counters.currentPos &&
      !counters.otherPos.includes(option.pos)
    ) {
      validated.pos = option.pos;
      counters.currentPos = option.pos; // eslint-disable-line
      counters.otherPos.push(option.pos);
    }
  }
  if ('order' in option) {
    // check right order
    if (
      option.order > counters.currentOrder &&
      !counters.otherOrders.includes(option.order)
    ) {
      validated.order = option.order;
      counters.currentOrder = option.order; // eslint-disable-line
      counters.otherOrders.push(option.order);
    }
  }
  if ('description' in option) {
    // check keys , content
    const description = Object.keys(option.description).reduce(
      (obj, locale) => {
        const text =
          option.description[locale] && option.description[locale].trim();
        if (text.length < MAX_DESCRIPTION_LENGTH && text.length > 0) {
          obj[locale] = text; // eslint-disable-line
        }
        return obj;
      },
      {},
    );
    if (Object.keys(description).length) {
      validated.description = description;
    }
  }
  if ('numVotes' in option) {
    //
  } else {
    validated.numVotes = 0;
  }

  if (
    'pos' in validated &&
    'order' in validated &&
    'description' in validated &&
    'numVotes' in validated
  ) {
    return validated;
  }
  throw new Error('Option not correct');
};
const validateOptions = options => {
  const counters = {
    currentPos: -1,
    currentOrder: -1,
    otherPos: [],
    otherOrders: [],
  };
  const data = options.map(option => checkOption(option, counters));
  return data;
};

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
    if (!data.pollingModeId) return null;
    if (!data.threshold) return null;
    if (!data.endTime) return null;

    const newData = { created_at: new Date() };

    if (data.options) {
      // check options
      const validatedOptions = validateOptions(data.options);
      newData.options = JSON.stringify(validatedOptions);
    }
    if ('extended' in data) {
      if (newData.options.length) {
        newData.extended = data.extended;
      }
    }
    if ('multipleChoice' in data) {
      newData.multipe_choice = data.multipeChoice;
    }
    if ('secret' in data) {
      newData.secret = data.secret;
    }

    if (data.startTime) {
      newData.start_time = data.startTime;
    }
    if (data.endTime) {
      newData.end_time = data.endTime;
    }
    if (data.pollingModeId) {
      newData.polling_mode_id = data.pollingModeId;
    }

    if (data.threshold) {
      newData.threshold = data.threshold;
    }

    // create

    const newPoll = await knex.transaction(async trx => {
      const pollingMode = await PollingMode.gen(
        viewer,
        data.pollingModeId,
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

      if (numVoter) {
        newData.num_voter = numVoter;
      }

      const [pollinDB = null] = await knex('polls')
        .transacting(trx)
        .insert(newData)
        .returning('*');
      return pollinDB;
    });
    if (!newPoll) return null;
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
