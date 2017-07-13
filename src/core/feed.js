/* eslint-disable import/prefer-default-export */
import Activity from '../data/models/Activity';
import knex from '../data/knex';
import log from '../logger';

export const insertIntoFeed = async ({ viewer, data, verb }, mainFeed) => {
  let result = false;
  const userId = 2;
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
      let systemActivities = await knex('system_feeds')
        .where({ user_id: userId })
        .select('activity_ids');
      systemActivities = systemActivities[0].activity_ids || [];
      systemActivities.push(activity.id);
      await knex('system_feeds')
        .where({ user_id: userId })
        .update({ activity_ids: JSON.stringify(systemActivities), updated_at: new Date() });
      result = true;
    } else {
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
        userActivities.push(activity.id);
        await knex('feeds')
          .where({ user_id: viewer.id })
          .update({ activity_ids: JSON.stringify([activity.id]), updated_at: new Date() });
      }
      result = true;
    }
  } catch (err) {
    log.error({ err, viewer, data, verb }, 'Insertion failed!');
    return result;
  }
  return result;
};
