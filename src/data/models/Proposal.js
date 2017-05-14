import knex from '../knex';
import Poll from './Poll';
import PollingMode from './PollingMode';
import Activity from './Activity';
import { dedup } from '../../core/helpers';

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
    // authorize
    if (!Proposal.canMutate(viewer, data)) return null;
    // validate
    if (!data.id) return null;
    if (!data.title && !data.text) return null;
    const proposalInDb = await Proposal.gen(viewer, data.id, loaders);
    if (!proposalInDb) return null;
    if (proposalInDb.title === data.title && proposalInDb.body === data.text) return null;

    // update
    await knex.transaction(async (trx) => {
      await trx
        .where({
          id: data.id,
        })
        .update({
          // Not sure if await needed
          body: data.text,
          title: data.title,
          updated_at: new Date(),
        })
        .into('proposals');
    });
    return Proposal.gen(viewer, data.id, loaders) || null;
  }

  static async create(viewer, data, loaders) {
    // authorize
    if (!Proposal.canMutate(viewer, data)) return null;
    // validate
    if (!data.text) return null;
    if (!data.title) return null;
    let createPollingMode = false;
    let pollingModeData;
    if (data.poll) {
      // validate poll
      let pollingMode;
      if (data.poll.mode && data.poll.mode.id) {
        pollingMode = await PollingMode.gen(viewer, data.poll.mode.id, loaders);

        if (!pollingMode) throw Error('PollingMode not found');
        // check if modifications
        const { id, ...props } = data.poll.mode;
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
        }
      }
    }
    // check Times
    const startTime = data.poll && data.poll.startTime ? new Date(data.poll.startTime) : new Date();
    if (!startTime.getMonth || typeof startTime.getMonth !== 'function') return null;

    let endTime;
    if (data.poll && data.poll.endTime) {
      endTime = new Date(data.poll.endTime);
    } else {
      endTime = new Date();
      endTime.setDate(startTime.getDate() + 3);
    }
    if (!endTime.getMonth || typeof endTime.getMonth !== 'function') return null;
    if (startTime >= endTime) throw Error('DateTime wrong');

    // check threshold;
    const threshold = data.poll.threshold || 20;

    const pollData = {
      secret: data.poll.secret || false,
      start_time: startTime,
      end_time: endTime,
      threshold,
    };

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
          state: 'proposed',
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
}

export default Proposal;
