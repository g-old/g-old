import knex from '../knex';

// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  return true;
}

class Activity {
  constructor(data) {
    this.id = data.id;
    this.actorId = data.actor_id;
    this.verb = data.verb;
    this.type = data.type;
    this.objectId = data.object_id;
    this.content = data.content;
    this.createdAt = data.created_at;
  }
  static async gen(viewer, id, { activities }) {
    const data = await activities.load(id);
    if (data === null) return null;
    const canSee = checkCanSee(viewer, data);
    return canSee ? new Activity(data) : null;
  }

  static async create(viewer, data) {
    if (!viewer) return null;
    if (!data.verb || !data.type || !data.objectId || !data.content) return null;
    const activity = {
      actor_id: viewer.id,
      verb: data.verb,
      type: data.type,
      object_id: data.objectId,
      content: JSON.stringify(data.content),
      created_at: new Date(),
    };
    let id = await knex('activities').insert(activity).returning('id');
    id = id[0];
    if (id == null) return null;
    return new Activity({ ...activity, id });
  }
}

export default Activity;
