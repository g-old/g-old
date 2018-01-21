import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';

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
    return canSee(viewer, data, Models.ACTIVITY) ? new Activity(data) : null;
  }

  static async create(viewer, data) {
    if (!viewer) return null;
    if (!data.verb || !data.type || !data.objectId || !data.content)
      return null;
    if (!canMutate(viewer, data, Models.ACTIVITY)) return null;
    const activity = {
      actor_id: viewer.id,
      verb: data.verb,
      type: data.type,
      object_id: data.objectId,
      content: JSON.stringify(data.content),
      created_at: new Date(),
    };
    let id = await knex('activities')
      .insert(activity)
      .returning('id');
    id = id[0];
    if (id == null) return null;
    const newActivity = await new Activity({ ...activity, id });
    if (newActivity) {
      EventManager.publish('onActivityCreated', {
        viewer,
        activity: newActivity,
        ...(data.workTeamId && { workTeamId: data.workTeamId }),
      });
    }
    return newActivity;
  }
}
export default Activity;
