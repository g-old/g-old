import knex from '../knex';
import Poll from './Poll';
import PollingMode from './PollingMode';
import Activity from './Activity';
import { dedup } from '../../core/helpers';
import { webPush } from '../../webPush';

// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}

const validateTags = async (tags) => {
  let existingTags;
  let newTags;
  // max tags
  if (!tags || tags.length > 8) return {};
  existingTags = tags.filter(tag => 'id' in tag);
  newTags = tags.filter(tag => 'text' in tag);

  // check if new tags don't already exist
  const queries = newTags.map(tag => knex('tags').where('text', 'ilike', tag.text).select());

  let duplicates = await Promise.all(queries);
  duplicates = duplicates.reduce((acc, curr) => acc.concat(curr), []);
  duplicates.forEach((dup) => {
    if (dup.id) {
      existingTags.push(dup);
      newTags = newTags.filter(t => t.text.toLowerCase() !== dup.text.toLowerCase());
    }
  });

  // deduplicate
  existingTags = dedup(existingTags);
  newTags = dedup(newTags);
  return { existingTags, newTags };
};

const validateDates = ({ poll }) => {
  const serverTime = new Date();
  const startTime = poll && poll.startTime ? new Date(poll.startTime) : serverTime;
  if (!startTime.getMonth || typeof startTime.getMonth !== 'function') return null;

  let endTime;
  if (poll && poll.endTime) {
    endTime = new Date(poll.endTime);
  } else {
    endTime = new Date();
    endTime.setDate(startTime.getDate() + 3);
  }
  if (!endTime.getMonth || typeof endTime.getMonth !== 'function') return null;
  if (startTime < serverTime || startTime >= endTime) throw Error('DateTime wrong');
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
    const { id, ...props } = poll.mode;
    const keys = Object.keys(props);
    if (keys.length > 0) {
      // check if values are different
      const diff = keys.reduce((acc, curr) => {
        if (props[curr] !== pollingMode[curr]) {
          // eslint-disable-next-line no-param-reassign
          acc += 1;
        }
        return acc;
      }, 0);
      createPollingMode = diff > 0;
      pollingModeData = { ...pollingMode, ...props };
      if (pollingMode.name === 'survey') {
        isSurvey = true;
        pollingModeData.thresholdRef = 'voters';
      }
    }
  }
  const { startTime, endTime } = validateDates({ poll });
  let threshold = poll.threshold;
  if (isSurvey) {
    threshold = 100;
  }
  const pollData = {
    secret: poll.secret || false,
    start_time: startTime,
    end_time: endTime,
    threshold: threshold || 50,
  };

  return { pollData, pollingModeData, createPollingMode };
};

const validateStateChange = async (viewer, { id, state, proposalInDB }, loaders) => {
  // if accepted pollOne must have passed endTime and sufficient votes
  if (!state || ['revoked', 'accepted'].indexOf(state) === -1) return false;
  if (state === 'accepted' && proposalInDB.state !== 'proposed') return false;
  if (state !== 'revoked') {
    const pollInDB = await Poll.gen(viewer, proposalInDB.pollOne_id, loaders);
    if (!pollInDB) throw Error('Poll not found');
    if (new Date(pollInDB.end_time) > new Date()) return false;
    const pollingModeinDB = await PollingMode.gen(viewer, pollInDB.pollingModeId, loaders);
    if (!pollingModeinDB) throw Error('PollingMode not found');

    let ref = null;
    switch (pollingModeinDB.thresholdRef) {
      case 'voters':
        ref = pollInDB.upvotes + pollInDB.downvotes;
        break;
      case 'all':
        ref = pollInDB.num_voter;
        break;

      default:
        throw Error(`Threshold reference not implemented: ${pollingModeinDB.thresholdRef}`);
    }

    ref *= pollInDB.threshold / 100;

    if (pollInDB.upvotes > ref) return false;
  }
  return true;
};

class Proposal {
  constructor(data) {
    this.id = data.id;
    this.author_id = data.author_id;
    this.title = data.title;
    this.body = data.body;
    this.votes = data.votes;
    this.pollOne_id = data.poll_one_id;
    this.pollTwo_id = data.poll_two_id;
    this.state = data.state;
    this.createdAt = data.created_at;
  }
  static async gen(viewer, id, { proposals }) {
    const data = await proposals.load(id);
    if (data == null) return null;
    if (viewer == null) return null;
    return new Proposal(data);
    // return canSee ? new Proposal(data) : new Proposal(data.email = null);
  }

  // eslint-disable-next-line no-unused-vars
  static canMutate(viewer, data) {
    return ['admin', 'mod'].includes(viewer.role.type);
  }

  static async followees(id, { followees }) {
    const data = await followees.load(id);
    return data;
    /*  return Promise.resolve(knex('user_follows')
    .where({ follower_id: id }).pluck('followee_id')
    .then(ids => {return ids; }));
      */
  }
  static async update(viewer, data, loaders) {
    // throw Error('TESTERROR');
    // authorize
    if (!Proposal.canMutate(viewer, data)) return null;
    // validate
    if (!data.id) return null;
    const proposalInDB = await Proposal.gen(viewer, data.id, loaders);
    if (!proposalInDB) return null;
    if (data.state && ['revoked', 'accepted'].indexOf(data.state) === -1) return null;

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
        { id: data.id, state: data.state, proposalInDB },
        loaders,
      );

      if (isValid) {
        newValues.state = data.state;
      } else {
        throw Error('State transition not allowed');
      }
    }
    const proposalId = await knex.transaction(async (trx) => {
      if (pollData) {
        // create poll
        let pId = data.poll.mode.id;
        // TODO check if they get reverted in case of rollback
        if (createPollingMode && pollingModeData) {
          const pMode = await PollingMode.create(viewer, pollingModeData, loaders);
          if (!pMode) throw Error('PollingMode failed');
          pId = pMode.id;
        }

        const pollTwoData = {
          polling_mode_id: pId,
          ...pollData,
        };
        const pollTwo = await Poll.create(viewer, pollTwoData, loaders);
        if (!pollTwo) throw Error('No pollTwo provided');
        // update/close pollOne
        // TODO check first if not already closed?
        const pollOne = await Poll.update(
          viewer,
          { id: proposalInDB.pollOne_id, closedAt: new Date() },
          loaders,
        );
        if (!pollOne) throw Error('No pollOne provided');
        newValues.poll_two_id = pollTwo.id;
      }
      if (newValues.state && newValues.state !== 'voting') {
        await trx
          .where({ id: proposalInDB.pollOne_id })
          .update({ closed_at: new Date(), updated_at: new Date() })
          .into('polls');
        loaders.polls.clear(proposalInDB.pollOne_id);
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
    return Proposal.gen(viewer, proposalId, loaders);
  }

  static async create(viewer, data, loaders) {
    // throw Error('TestError');
    // authorize
    if (!Proposal.canMutate(viewer, data)) return null;
    // validate
    if (!data.text) return null;
    if (!data.title) return null;
    const { pollData, pollingModeData, createPollingMode } = await validatePoll(
      viewer,
      data.poll,
      loaders,
    );

    // tags
    const { existingTags, newTags } = await validateTags(data.tags);

    const newProposalId = await knex.transaction(async (trx) => {
      let pId = data.poll.mode.id;
      // TODO check if they get reverted in case of rollback
      if (createPollingMode && pollingModeData) {
        const pMode = await PollingMode.create(viewer, pollingModeData, loaders);
        if (!pMode) throw Error('PollingMode failed');
        pId = pMode.id;
      }

      const pollOneData = {
        polling_mode_id: pId,
        ...pollData,
      };
      const pollOne = await Poll.create(viewer, pollOneData, loaders);
      if (!pollOne) throw Error('No pollOne provided');

      const id = await trx
        .insert(
        {
          author_id: viewer.id,
          title: data.title,
          body: data.text,
          poll_one_id: pollOne.id,
          state: data.state === 'survey' ? 'survey' : 'proposed',
          created_at: new Date(),
        },
          'id',
        )
        .into('proposals');

      // tags

      if (existingTags && existingTags.length) {
        await trx
          .insert(existingTags.map(t => ({ proposal_id: id[0], tag_id: t.id })))
          .into('proposal_tags');

        // update counts
        await Promise.all(
          existingTags.map(t => trx.where({ id: t.id }).increment('count', 1).into('tags')),
        );
      }

      if (newTags && newTags.length) {
        const ids = await trx
          .insert(newTags.map(t => ({ text: t.text, count: 1 })))
          .into('tags')
          .returning('id');
        await Promise.all(
          ids.map(tId => trx.insert({ proposal_id: id[0], tag_id: tId }).into('proposal_tags')),
        );
        //
      }
      return id[0];
    });
    if (!newProposalId) return null;
    return Proposal.gen(viewer, newProposalId, loaders);
  }

  static async insertInFeed(viewer, proposal, verb) {
    // create activity;
    const userId = 1;
    const activityId = await Activity.create(
      { id: viewer.id },
      { action: 'create', verb, type: 'proposal', objectId: proposal.id },
    );
    // add activity to feed
    // create activity;

    let aIds = await knex('system_feeds').where({ user_id: userId }).select('activity_ids');
    aIds = aIds[0].activity_ids;
    aIds.push(activityId[0]);
    await knex('system_feeds')
      .where({ user_id: userId })
      .update({ activity_ids: JSON.stringify(aIds), updated_at: new Date() });
  }

  static async pushToUsers(viewer, proposal) {
    const subscriptions = await knex('webpush_subscriptions').select();
    const allSubs = subscriptions.map(s => ({
      endpoint: s.endpoint,
      keys: { auth: s.auth, p256dh: s.p256dh },
    }));

    const promises = allSubs.map(sub =>
      webPush.sendNotification(sub, `Greetings from GOLD: ${proposal.title}`).catch(async (err) => {
        if (err.statusCode === 410) {
          console.error('Subscription should be deleted from DB: ', err);
          await knex('webpush_subscriptions').where({ endpoint: sub.endpoint }).del();
        }
        console.error('Subscription is no longer valid: ', err);
      }),
    );

    await Promise.all(promises);
    return proposal;
  }
}

export default Proposal;
