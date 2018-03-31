// @flow

import knex from '../knex';
import User from './User';
import Activity /* , { ResourceType, SubjectType } */ from './Activity';
import Post from './Post';
// import Proposal from './Proposal';
// import Discussion from './Discussion';

// https://github.com/clux/decay/blob/master/decay.js
/* function rankStatements(likes, date) {
  const decay = 45000;

  const order = Math.log(Math.max(Math.abs(likes), 1)) / Math.LN10;
  const secAge = (Date.now() - date.getTime()) / 1000;
  return order - secAge / decay;
} */

// older means bigger result
/* function timeDecay(date) {
  const decay = 45000;
  return (Date.now() - date.getTime()) / 1000 / decay;
} */
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  return true;
}

/* function rankInPlace(activity) {
  // how important is this for the user
  const affinity = 1;
  // what action/content happened
  const content = 1;
  //if (activity.type === 'proposal') {
  //  content = 5;
  //  if (activity.verb === 'close') {
  //    content = 10;
  //  }
  //}

  // time-based decay
  const decay = timeDecay(activity.createdAt);
  // eslint-disable-next-line no-param-reassign
  activity.rank = affinity + content - decay; //  eslint-disable-line no-mixed-operators
} */
const loadActivities = (viewer, ids, loaders): Activity[] =>
  Promise.all(ids.map(id => Activity.gen(viewer, id, loaders)));

/* extract subjects from activities */
const createPosts = (activities: Activity[], viewer) =>
  activities.reduce(
    (res, activity) => {
      // filter workteam content by visibility
      if (
        activity.content &&
        activity.content.workTeamId &&
        !viewer.wtMemberships.includes(activity.content.workTeamId)
      ) {
        return res;
      }

      const { subjectId, subjectType } = activity;
      if (!subjectId || !subjectType) return res;

      // skip duplicate subjects
      const uniqueSubjectId = subjectType + subjectId;
      if (res.handledSubjectIds.has(uniqueSubjectId)) return res;
      res.handledSubjectIds.add(uniqueSubjectId);

      const post: Post = {
        id: uniqueSubjectId,
        subjectId,
        type: subjectType,
        verb: 'TODO',
        rank: activity.id,
      };

      res.posts.push(post);
      return res;
    },
    {
      handledSubjectIds: new Set(),
      posts: [],
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
      logIds = logIds[0] || {};
      //  if (!logIds) return null;
      logIds = logIds.activity_ids || [];
      const logs = await loadActivities(viewer, logIds, loaders);
      return logs ? logs.reverse() : null;
    }

    const aIds = await knex('system_feeds')
      .where({ group_id: 1, type: 'GROUP' })
      .select('main_activities', 'activities');

    // TODO check if join is better
    let fIds = await User.followees(viewer, viewer.id, loaders)
      .then(data =>
        Promise.all(
          data.map(u =>
            knex('feeds')
              .where({ user_id: u })
              .select('activity_ids'),
          ),
        ),
      )
      .then(data => data);
    let workTeamMainIds = [];
    if (viewer.wtMemberships.length) {
      workTeamMainIds = await knex('system_feeds')
        .where({ type: 'WT' })
        .whereIn('group_id', viewer.wtMemberships)
        .select('main_activities', 'activities');
    }
    // TODO flatten arrays
    // fetch all activities
    fIds = fIds.reduce((acc, curr) => acc.concat(curr), []);
    fIds = fIds.reduce((acc, curr) => acc.concat(curr.activity_ids), []);
    workTeamMainIds = workTeamMainIds.reduce(
      (acc, curr) => acc.concat(curr.main_activities.concat(curr.activities)),
      [],
    );

    //  fIds = fIds[0].activity_ids,
    // deduplicate Ids

    const allIds = [
      ...new Set([
        ...aIds[0].activities,
        ...aIds[0].main_activities,
        ...fIds,
        ...workTeamMainIds,
      ]),
    ];

    const descendingById = allIds.sort((a, b) => b - a);
    const allActivities = await loadActivities(viewer, descendingById, loaders);

    // get relevant subjects (proposals, discussions...)
    const { posts } = createPosts(allActivities, viewer);
    /**
      sort not needed, as the rank is equal to the activity id,
      and activities were already sorted
      subjects.sort((a, b) => b.rank - a.rank);
    */

    // TODO: store to history;
    /* const history = posts.map(a => a.id);
    await knex('feeds')
      .where({ user_id: viewer.id })
      .update({ history: JSON.stringify(history), updated_at: new Date() }); */

    // TODO paginate feed. How?
    return posts.slice(0, 30);
  }
}

export default Feed;
