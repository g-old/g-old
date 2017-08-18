/* eslint-disable import/prefer-default-export */
import Activity from '../data/models/Activity';
import Notification from '../data/models/Notification';
import WorkTeam from '../data/models/WorkTeam';
import knex from '../data/knex';
import log from '../logger';

export async function insertIntoFeed({ viewer, data, verb }, mainFeed) {
  let result = null;
  const maxFeedLength = 30;
  let userId = 2;
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
      }
      let systemActivities = await knex('system_feeds')
        .where({ user_id: userId })
        .select('activity_ids');
      systemActivities = systemActivities[0].activity_ids || [];
      while (systemActivities.length >= maxFeedLength) {
        systemActivities.shift();
      }
      systemActivities.push(activity.id);
      await knex('system_feeds')
        .where({ user_id: userId })
        .update({ activity_ids: JSON.stringify(systemActivities), updated_at: new Date() });

      if (data.type === 'proposal') return activity.id; // or whole data?
    }
    // insert also in own feed to for followers
    let userActivities = await knex('feeds').where({ user_id: viewer.id }).select('activity_ids');

    userActivities = userActivities[0];
    if (!userActivities) {
      await knex('feeds').insert({
        user_id: viewer.id,
        activity_ids: JSON.stringify([activity.id]),
        created_at: new Date(),
      });
    } else {
      userActivities = userActivities.activity_ids || [];
      while (userActivities.length >= maxFeedLength) {
        userActivities.shift();
      }
      userActivities.push(activity.id);
      await knex('feeds')
        .where({ user_id: viewer.id })
        .update({ activity_ids: JSON.stringify(userActivities), updated_at: new Date() });
    }
    result = activity.id; // or whole data?
  } catch (err) {
    log.error({ err, viewer, data, verb }, 'Insertion failed!');
    return result;
  }
  return result;
}

export async function circularFeedNotification({ viewer, data, verb, receiver }) {
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
      await knex('notifications').where({ id: notification.id }).del();
      return result;
    }

    if (receiver.type !== 'team') throw Error(`Other receivers not implemented: ${receiver}`);
    const team = await WorkTeam.gen(viewer, receiver.id);
    if (!team) throw new Error(`Team not found: Receiver: ${JSON.stringify(receiver)}`);
    const res = await team.circularFeedNotification(viewer, activity);
    if (!res) {
      // delete all
      await knex('notifications').where({ id: notification.id }).del();
      await knex('activities').where({ id: activity.id }).del();
    }
    log.info(`Notification sent to team ${team.name}`);
    return res;
  } catch (err) {
    log.error({ err, args: { viewer, data, verb, receiver } }, 'CircularFeedInsertion failed');
    return null;
  }
}
