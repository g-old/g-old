import knex from '../knex';
import User from './User';
import Activity from './Activity';

// https://github.com/clux/decay/blob/master/decay.js
/* function rankStatements(likes, date) {
  const decay = 45000;

  const order = Math.log(Math.max(Math.abs(likes), 1)) / Math.LN10;
  const secAge = (Date.now() - date.getTime()) / 1000;
  return order - secAge / decay;
} */

// older means bigger result
function timeDecay(date) {
  const decay = 45000;
  return (Date.now() - date.getTime()) / 1000 / decay;
}
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  return true;
}

function rankInPlace(activity) {
  // how important is this for the user
  const affinity = 1;
  // what action/content happened
  const content = 1;
  /*  if (activity.type === 'proposal') {
    content = 5;
    if (activity.verb === 'close') {
      content = 10;
    }
  } */

  // time-based decay
  const decay = timeDecay(activity.createdAt);
  // eslint-disable-next-line no-param-reassign
  activity.rank = affinity + content - decay; //  eslint-disable-line no-mixed-operators
}
const loadActivities = (viewer, ids, loaders) =>
  Promise.all(ids.map(id => Activity.gen(viewer, id, loaders)));

const aggregateActivities = activities =>
  activities.reduce(
    (agg, curr) => {
      if (curr.verb === 'delete') {
        // eslint-disable-next-line no-param-reassign
        agg.del[curr.objectId] = curr.objectId;
        return agg;
      }
      if (curr.type === 'statement') {
        if (curr.verb === 'update') {
          if (curr.objectId in agg.updatedStatements) {
            return agg; // dont' push, as it is an old update
          }
          // eslint-disable-next-line no-param-reassign
          agg.updatedStatements[curr.objectId] = curr.objectId;
        }
        if (curr.verb === 'create') {
          if (
            curr.content.pollId in agg.polls &&
            curr.content.author_id === agg.polls[curr.content.pollId]
          ) {
            return agg;
          }
          // eslint-disable-next-line no-param-reassign
          agg.polls[curr.content.pollId] = curr.content.author_id;
        }
      }
      if (curr.type === 'proposal') {
        if (curr.verb === 'update') {
          if (curr.objectId in agg.updatedProposals) {
            return agg; // dont' push, as it is an old update
          }
          // eslint-disable-next-line no-param-reassign
          agg.updatedProposals[curr.objectId] = curr.objectId;
        }
      }
      if (curr.type === 'notification') {
        // dont't include other notifications!
        return agg;
      }
      agg.all.push(curr);
      return agg;
    },
    {
      del: {},
      all: [],
      updatedProposals: {},
      updatedStatements: {},
      polls: {},
    },
  );

class Feed {
  constructor(data) {
    this.id = data.id;
    this.actorId = data.actor_id;
    this.verb = data.verb;
    this.type = data.type;
    this.objectId = data.object_id;
    this.content = data.content;
    this.createdAt = data.created_at;
  }
  static async gen(viewer, id, loaders) {
    // authorize
    // get proposalsfeed;
    if (viewer && id) {
      /*  const e = Math.random();
      if (e > 0.5) {
        console.log('ERROR');
        throw new Error('TESTERROR');
      } */
      let logIds = await knex('feeds')
        .where({ user_id: id })
        .select('activity_ids');
      logIds = logIds[0];
      if (!logIds) return null;
      logIds = logIds.activity_ids;
      const logs = await loadActivities(viewer, logIds, loaders);
      return logs ? logs.reverse() : null;
    }

    let aIds = await knex('system_feeds')
      .where({ user_id: 1 })
      .select('activity_ids');
    let sIds = await knex('system_feeds')
      .where({ user_id: 2 })
      .select('activity_ids');
    let fIds = await User.followees(viewer, viewer.id, loaders)
      .then(data =>
        Promise.all(
          data.map(u =>
            knex('feeds').where({ user_id: u }).select('activity_ids'),
          ),
        ),
      )
      .then(data => data);
    // TODO flatten arrays
    // fetch all activities
    fIds = fIds.reduce((acc, curr) => acc.concat(curr), []);
    fIds = fIds.reduce((acc, curr) => acc.concat(curr.activity_ids), []);
    //  fIds = fIds[0].activity_ids,
    aIds = aIds[0].activity_ids;
    sIds = sIds[0].activity_ids;
    // deduplicate Ids
    const allIds = [...new Set([...aIds, ...sIds, ...fIds])];
    const allActivities = await loadActivities(viewer, allIds, loaders);
    // process them
    // deduplicate

    // aggregate

    // filter deleted statements
    // reverse so newest are in front BUT: not sorted by time

    allActivities.reverse();
    const sorted = aggregateActivities(allActivities);

    const aggregated = sorted.all.filter(e => {
      if (e.objectId in sorted.del) {
        return false;
      }
      if (e.type === 'proposal') {
        if (e.objectId in sorted.updatedProposals) {
          if (e.verb === 'update') {
            return true; // get only updated ones
          }
          return false;
        }
      }
      return true;
    });

    aggregated.forEach(el => {
      rankInPlace(el);
    });

    aggregated.sort((a, b) => b.rank - a.rank);
    // store to history;
    const history = aggregated.map(a => a.id);
    await knex('feeds')
      .where({ user_id: viewer.id })
      .update({ history: JSON.stringify(history), updated_at: new Date() });

    // TODO store activity ids in userfeed - then recompose only if updates in other feeds
    // TODO paginate feed. How?
    return aggregated.slice(0, 30);
  }
}

export default Feed;
