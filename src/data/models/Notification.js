import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';

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
}

export default Notification;
