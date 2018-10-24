// @flow

import knex from '../knex';
import PollingMode from './PollingMode';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { Groups } from '../../organization';
import { transactify } from './utils';
import sanitize from '../../core/htmlSanitizer';

const MAX_DESCRIPTION_LENGTH = 10000;
const MAX_TITLE_LENGTH = 100;

const isAscendingUniqueNumber = (value, lastIndex, bucket) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return false;
  }
  if (bucket.includes(value)) {
    return false;
  }

  if (value <= lastIndex) {
    return false;
  }

  bucket.push(value);
  return true;
};

class Translation {
  de: ?string;

  it: ?string;

  lld: ?string;

  _default: ?string;

  constructor(props) {
    this.de = props.de;
    this.it = props.it;
    this.lld = props.lld;
    this._default = props._default; // eslint-disable-line
  }

  validate(predicate) {
    // eslint-disable-next-line no-underscore-dangle
    const translations = [this.de, this.it, this.lld, this._default];
    const atleastOneTranslation = translations.some(t => t);

    if (!atleastOneTranslation) {
      throw new Error('No key found');
    }
    translations.forEach(text => {
      if (text) {
        if (!predicate(text)) {
          throw new Error(`Argument error: ${text}`);
        }
      }
    });
  }
}

const isValidTitle = text => text.length < MAX_TITLE_LENGTH && text.length > 0;

const isValidDescription = text =>
  text.length < MAX_DESCRIPTION_LENGTH && text.length > 0;

type OptionProps = $Shape<OptionShape>;
class Option {
  pos: ?number;

  order: ?number;

  title: ?mixed;

  description: ?{};

  constructor(props: OptionProps) {
    this.pos = props.pos;
    this.order = props.order;
    this.title = props.title;
    this.description = props.description || null;
    this.numVotes = 0;
  }

  validateDescription() {
    if (this.description) {
      this.checkDescriptionShape();
    }
  }

  sanitizeDescription() {
    if (this.description && typeof this.description === 'object') {
      const sanitizedDescription = Object.keys(this.description).reduce(
        (obj, locale) => {
          const text = this.description[locale].trim();
          if (!text) {
            return obj;
          }
          obj[locale] = sanitize(text); // eslint-disable-line
          return obj;
        },
        {},
      );
      if (sanitizedDescription) {
        this.description = sanitizedDescription;
      }
    }
  }

  validateTitle() {
    if (!this.title) {
      throw new Error('Title missing');
    }
    const title = new Translation(this.title);
    // TODO should use translation obj as it makes sure the keys are correct
    title.validate(isValidTitle);
  }

  checkDescriptionShape() {
    const description = new Translation(this.description);
    description.validate(isValidDescription);
  }
}

class OptionsValidator {
  pos: number;

  order: number;

  takenPositions: number[];

  takenOrders: number[];

  constructor() {
    this.pos = -1;
    this.order = -1;
    this.takenPositions = [];
    this.takenOrders = [];
  }

  validate(optionData) {
    const option = new Option(optionData);
    const validPosition = isAscendingUniqueNumber(
      option.pos,
      this.pos,
      this.takenPositions,
    );
    if (!validPosition) {
      throw new Error(`Position wrong: ${option.pos}`);
    }
    const validOrder = isAscendingUniqueNumber(
      option.order,
      this.order,
      this.takenOrders,
    );

    if (!validOrder) {
      throw new Error(`Order wrong${option.order}`);
    }

    option.validateTitle();
    option.validateDescription();

    if (option.description) {
      // facultative
      option.sanitizeDescription();
    }
    return option;
  }

  getValidatedOptions(options) {
    return options.map(this.validate, this);
  }
}
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}

const validateDates = data => {
  const serverTime = new Date();
  const startTime =
    data && data.startTime ? new Date(data.startTime) : serverTime;
  if (!startTime.getMonth || typeof startTime.getMonth !== 'function')
    return null;

  let endTime;
  if (data && data.endTime) {
    endTime = new Date(data.endTime);
  } else {
    endTime = new Date();
    endTime.setDate(startTime.getDate() + 3);
  }
  if (!endTime.getMonth || typeof endTime.getMonth !== 'function') return null;
  if (startTime < serverTime || startTime >= endTime)
    throw Error('DateTime wrong');
  return { startTime, endTime };
};

class Poll {
  id: ID;

  pollingModeId: ID;

  secret: boolean;

  threshold: number;

  numVoter: number;

  startTime: ?string;

  endTime: string;

  closedAt: ?string;

  extended: boolean;

  multipleChoice: boolean;

  options: OptionShape[];

  numVotes: number;

  constructor(data) {
    this.id = data.id;
    this.pollingModeId = data.polling_mode_id;
    this.secret = data.secret;
    this.threshold = data.threshold;
    this.numVoter = data.num_voter;
    this.startTime = data.start_time;
    this.endTime = data.end_time;
    this.closedAt = data.closed_at;
    this.extended = data.extended;
    this.multipleChoice = data.multiple_choice;
    this.options = data.options;
    this.numVotes = data.num_votes;
  }

  static async gen(viewer: ViewerShape, id: ID, { polls }) {
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

  hasEnded() {
    return new Date(this.endTime) <= new Date();
  }

  async isUnipolar(viewer: ViewerShape, loaders) {
    const mode = await PollingMode.gen(viewer, this.pollingModeId, loaders);
    return mode.unipolar === true;
  }

  async isCommentable(viewer: ViewerShape, loaders) {
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
  static async create(viewer: ViewerShape, data, loaders, trx) {
    // authorize
    if (!canMutate(viewer, data, Models.POLL)) return null;

    // validate
    if (!data.pollingModeId) return null;
    if (!data.threshold) return null;

    const newData = { created_at: new Date() };

    if (data.options) {
      // check options
      const validator = new OptionsValidator();
      const validatedOptions = validator.getValidatedOptions(data.options);
      newData.options = JSON.stringify(validatedOptions);
    }
    if ('extended' in data) {
      if (newData.options && newData.options.length) {
        newData.extended = data.extended;
      }
    }
    //

    if ('multipleChoice' in data) {
      newData.multiple_choice = data.multipleChoice;
    }
    if ('secret' in data) {
      newData.secret = data.secret;
    }

    const { startTime, endTime } = validateDates(data);

    if (startTime) {
      newData.start_time = startTime;
    }
    if (endTime) {
      newData.end_time = endTime;
    } else {
      throw new Error('No endTime provided');
    }
    if (data.pollingModeId) {
      newData.polling_mode_id = data.pollingModeId;
    }

    if (data.threshold) {
      newData.threshold = data.threshold;
    }

    // create

    const createPoll = async transaction => {
      const [pollingModeData = null] = await knex('polling_modes')
        .transacting(transaction)
        .where({ id: data.pollingModeId })
        .limit(1)
        .select('*');
      if (!pollingModeData) throw Error('No valid PollingMode provided');
      const pollingMode = new PollingMode(pollingModeData);
      let numVoter = 0;

      if (!newData.extended) {
        const options = [
          { pos: 0, order: 0, numVotes: 0, description: { _default: 'up' } },
        ];

        if (!pollingMode.unipolar) {
          options.push({
            pos: 1,
            order: 1,
            numVotes: 0,
            description: { _default: 'down' },
          });
        }
        newData.options = JSON.stringify(options);
      }

      if (pollingMode.thresholdRef === 'all') {
        // TODO change completely in case of group model
        if (data.workTeamId) {
          numVoter = await knex('user_work_teams')
            .transacting(transaction)
            .where({ work_team_id: data.workTeamId })
            .join('users', 'users.id', 'user_work_teams.user_id') // bc also viewers can be members
            .whereRaw('users.groups & ? > 0', [Groups.VIEWER]) // TODO whitelist
            .count('users.id');
        } else {
          numVoter = await transaction
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

      const [pollInDB = null] = await knex('polls')
        .transacting(transaction)
        .insert(newData)
        .returning('*');
      return pollInDB;
    };

    const newPoll = await transactify(createPoll, knex, trx);
    if (!newPoll) return null;
    return new Poll(newPoll);
  }

  static async update(viewer, data, loaders, trx) {
    // authorize
    if (!canMutate(viewer, data, Models.POLL)) return null;
    // validate
    if (!data.id) return null;
    const newData = {};
    if (data.closedAt) {
      newData.closed_at = data.closedAt;
      newData.updated_at = new Date();
    }

    const updatePoll = async transaction =>
      knex('polls')
        .transacting(transaction)
        .where({ id: data.id })
        .update(newData)
        .returning('*');

    const pollData = await transactify(updatePoll, knex, trx);
    loaders.polls.clear(data.id);
    return pollData && new Poll(pollData);
  }
}

export default Poll;
