import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { ActivityVerb } from './Activity';
import EventManager from '../../core/EventManager';
import log from '../../logger';

class Notification {
  constructor(data) {
    this.id = data.id;
    this.activityId = data.activity_id;
    this.read = data.read;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async gen(viewer, id, { notifications }) {
    const data = await notifications.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.NOTIFICATION)
      ? new Notification(data)
      : null;
  }

  static async create(viewer, data) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.NOTIFICATION)) return null;

    const newData = {
      created_at: new Date(),
    };
    const notificationInDB = await knex.transaction(async trx => {
      const [notification = null] = await knex('notifications')
        .transacting(trx)
        .insert(newData)
        .returning('*');

      return notification;
    });

    return notificationInDB ? new Notification(notificationInDB) : null;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.NOTIFICATION)) return null;
    const newData = { updated_at: new Date() };
    if ('read' in data) {
      newData.read = data.read;
    }
    const updatedNotification = await knex.transaction(async trx => {
      const [notification = null] = await knex('notifications')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      return notification;
    });

    return updatedNotification ? new Notification(updatedNotification) : null;
  }

  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.NOTIFICATION)) return null;
    const deletedNotification = await knex.transaction(async trx => {
      await knex('notifications')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();
    });

    return deletedNotification ? new Notification(deletedNotification) : null;
  }

  static async batchUpdate(viewer) {
    if (!viewer) return null;

    const updatedIds = await knex('notifications')
      .where({ user_id: viewer.id, read: false })
      .update({ read: true })
      .returning('id');

    return updatedIds;
  }
}

EventManager.subscribe('onStatementDeleted', ({ statement }) =>
  knex('activities')
    .where({ object_id: statement.id, verb: ActivityVerb.CREATE })
    .pluck('id')
    .then(([aId]) => {
      if (aId) {
        return knex('notifications')
          .where({ activity_id: aId })
          .del();
      }
      return Promise.resolve();
    })
    .catch(err => {
      log.error({ err }, 'Notification deletion failed');
    }),
);

EventManager.subscribe('onCommentDeleted', ({ comment }) =>
  knex('activities')
    .where({ object_id: comment.id, verb: ActivityVerb.CREATE })
    .pluck('id')
    .then(([aId]) => {
      if (aId) {
        return knex('notifications')
          .where({ activity_id: aId })
          .del();
      }
      return Promise.resolve();
    })
    .catch(err => {
      log.error({ err }, 'Notification deletion failed');
    }),
);

export default Notification;
