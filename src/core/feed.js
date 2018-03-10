/* eslint-disable import/prefer-default-export */
import Activity from '../data/models/Activity';
import Notification from '../data/models/Notification';
import Group from '../data/models/Group';
import knex from '../data/knex';
import log from '../logger';
import User from '../data/models/User';

const maxFeedLength = 30;

/*
class FeedManager{
  constructor(){
    this.maxFeedLength = 30;
  }
  insertActivity({groupId, activityId}){

  }
}
*/
async function pushToLog(userId, activityId) {
  try {
    let [userActivities = null] = await knex('feeds')
      .where({ user_id: userId })
      .select('activity_ids');

    if (!userActivities) {
      return knex('feeds').insert({
        user_id: userId,
        activity_ids: JSON.stringify([activityId]),
        created_at: new Date(),
      });
    }
    userActivities = userActivities.activity_ids || [];
    while (userActivities.length >= maxFeedLength) {
      userActivities.shift();
    }
    userActivities.push(activityId);
    return knex('feeds')
      .where({ user_id: userId })
      .update({
        activity_ids: JSON.stringify(userActivities),
        updated_at: new Date(),
      });
  } catch (err) {
    log.error(
      { err, data: { userId, activityId } },
      'Notification insertion failed',
    );
    return Promise.resolve();
  }
}
// TODO complete rewrite
export async function insertIntoFeed({ viewer, data, verb }, mainFeed) {
  let result = null;
  let userId = 2;
  let field = 'activities';
  try {
    const activity = await Activity.create(viewer, {
      verb,
      type: data.type,
      objectId: data.objectId,
      content: data.content,
    });
    if (!activity) {
      return result;
    }
    if (mainFeed) {
      if (data.type === 'proposal') {
        userId = 1; // in systemfeed 1
        field = 'main_activities';
      }
      let systemActivities = await knex('system_feeds')
        .where({ group_id: userId, type: 'GROUP' })
        .select(field);
      systemActivities = systemActivities[0][field] || [];
      while (systemActivities.length >= maxFeedLength) {
        systemActivities.shift();
      }
      systemActivities.push(activity.id);
      await knex('system_feeds')
        .where({ group_id: userId, type: 'GROUP' })
        .update({
          [field]: JSON.stringify(systemActivities),
          updated_at: new Date(),
        });

      if (data.type === 'proposal') return activity.id; // or whole data?
    }
    // insert also in own feed to for followers
    await pushToLog(viewer.id, activity.id);

    result = activity.id; // or whole data?
  } catch (err) {
    log.error({ err, viewer, data, verb }, 'Insertion failed!');
    return result;
  }
  return result;
}

export async function insertIntoGroupFeeds(
  { viewer, data, verb, type, groupId },
  mainFeed,
) {
  let result = null;
  const field = mainFeed ? 'main_activities' : 'activities';
  try {
    const activity = await Activity.create(viewer, {
      verb,
      type: data.type,
      objectId: data.objectId,
      content: data.content,
    });
    if (!activity) {
      return result;
    }

    let [activityIds = []] = await knex('system_feeds')
      .where({ group_id: groupId, type })
      .select(field);
    activityIds = activityIds[field];
    while (activityIds.length >= maxFeedLength) {
      activityIds.shift();
    }
    activityIds.push(activity.id);
    await knex('system_feeds')
      .where({ group_id: groupId, type })
      .update({
        [field]: JSON.stringify(activityIds),
        updated_at: new Date(),
      });

    if (['comments', 'statements', 'votes'].includes(type)) {
      // insert also in own feed to for followers
      await pushToLog(viewer.id, activity.id);
    }

    result = activity.id; // or whole data?
  } catch (err) {
    log.error({ err, viewer, data, verb }, 'Insertion failed!');
    return result;
  }
  return result;
}

export async function circularFeedNotification({
  viewer,
  data,
  verb,
  receiver,
  loaders,
}) {
  if (!viewer || !data || !verb || !receiver || !receiver.id) {
    throw new Error(`Arguments missing for circularFeedInsertion:
    viewer: ${viewer}, data: ${data}, verb: ${verb}, receiver: ${receiver} `);
  }
  const result = null;
  try {
    const notification = await Notification.create(viewer, {
      type: data.notificationType, // event or msg
      msg: data.msg,
      title: data.title,
      date: data.date,
      location: data.location,
    });

    if (!notification) return null;
    const activity = await Activity.create(viewer, {
      verb,
      type: 'notification',
      objectId: notification.id,
      content: notification,
    });
    if (!activity) {
      await knex('notifications')
        .where({ id: notification.id })
        .del();
      return result;
    }
    let res;
    if (receiver.type === 'team') {
      const team = await Group.gen(viewer, receiver.id);
      if (!team) {
        throw new Error(
          `Team not found: Receiver: ${JSON.stringify(receiver)}`,
        );
      }
      res = await team.circularFeedNotification(viewer, activity, pushToLog);
      log.info(`Notification sent to team ${team.name}`);
    } else if (receiver.type === 'user') {
      // get user
      const recipient = await User.gen(viewer, receiver.id, loaders);
      if (recipient) {
        res = pushToLog(recipient.id, activity.id);
      }
    } else {
      throw Error(`Other receivers not implemented: ${receiver}`);
    }
    if (!res) {
      // delete all
      await knex('notifications')
        .where({ id: notification.id })
        .del();
      await knex('activities')
        .where({ id: activity.id })
        .del();
    }
    return res;
  } catch (err) {
    log.error(
      { err, args: { viewer, data, verb, receiver } },
      'CircularFeedInsertion failed',
    );
    return null;
  }
}
