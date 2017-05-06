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
  let content = 1;
  if (activity.type === 'proposal') {
    content = 5;
    if (activity.verb === 'close') {
      content = 10;
    }
  }

  // time-based decay
  const decay = timeDecay(activity.createdAt);
  // eslint-disable-next-line no-param-reassign
  activity.rank = (affinity + content) - decay;
}
const loadActivities = (viewer, ids, loaders) =>
  Promise.all(ids.map(id => Activity.gen(viewer, id, loaders)));

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

    let aIds = await knex('system_feeds').where({ user_id: 1 }).select('activity_ids');
    let sIds = await knex('system_feeds').where({ user_id: 2 }).select('activity_ids');
    let fIds = await User.followees(viewer.id, loaders)
      .then(data =>
        Promise.all(data.map(u => knex('feeds').where({ user_id: u }).select('activity_ids'))),
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

    // rank
    allActivities.forEach((el) => {
      rankInPlace(el);
    });

    // sort
    //  allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    allActivities.sort((a, b) => b.rank - a.rank);
    return allActivities;
  }
}

export default Feed;
