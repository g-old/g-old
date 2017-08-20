import knex from '../knex';
// import { PRIVILEGES } from '../../constants';

// eslint-disable-next-line no-unused-vars
function canMutate(viewer, data) {
  // eslint-disable-next-line no-bitwise
  if (viewer /* && viewer.privilege & PRIVILEGES.canNotifyUser*/) {
    return true;
  }
  return false;
}

function checkCanSee(viewer) {
  return viewer;
}

class Notification {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.date = data.date;
    this.location = data.location;
    this.msg = data.msg;
    this.title = data.title;
    this.senderId = data.sender_id;
    this.createdAt = data.created_at;
  }

  static async gen(viewer, id) {
    if (!checkCanSee(viewer)) return null;

    let data = await knex('notifications').where({ id }).select();
    data = data[0];
    return data ? new Notification(data) : null;
  }

  static async create(viewer, data, loaders, trx) {
    if (!canMutate(viewer, data)) return null;
    if (!data || !data.type || !data.msg) return null;

    let notification;
    const newData = Object.keys(data).reduce(
      (acc, curr) => {
        if (!(curr in acc)) {
          acc[curr] = data[curr];
        }
        return acc;
      },
      {
        type: data.type,
        msg: data.msg,
        sender_id: viewer.id,
      },
    );

    if (trx) {
      notification = await knex('notifications').transacting(trx).insert(newData).returning('*');
    } else {
      notification = await knex('notifications').insert(newData).returning('*');
    }

    notification = notification[0];

    return notification ? new Notification(notification) : null;
  }
}

export default Notification;
