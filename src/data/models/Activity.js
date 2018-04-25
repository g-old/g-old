// @flow
import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';

export const ActivityType = {
  PROPOSAL: 'proposal',
  STATEMENT: 'statement',
  LIKE: 'like',
  VOTE: 'vote',
  POLL: 'poll',
  MESSAGE: 'message',
  DISCUSSION: 'discussion',
  COMMENT: 'comment',
  REQUEST: 'request',
  SURVEY: 'survey',
};
export const ActivityVerb = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  CLOSE: 'close',
  ACCEPT: 'accept',
  REJECT: 'reject',
};

class Activity {
  id: number | string;
  actorId: number | string;
  verb: string;
  objectId: number | string;
  type: string;
  content: {};
  createdAt: string;

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
    const newData = {
      actor_id: viewer.id,
      verb: data.verb,
      type: data.type,
      object_id: data.objectId,
      content: JSON.stringify(data.content),
      created_at: new Date(),
    };
    const [activity = null] = await knex('activities')
      .insert(newData)
      .returning('*');
    if (activity == null) return null;
    const newActivity = await new Activity(activity);
    if (newActivity) {
      EventManager.publish('onActivityCreated', {
        viewer,
        activity: newActivity,
        ...(data.workTeamId && { workTeamId: data.workTeamId }),
        subjectId: data.subjectId,
      });
    }
    return newActivity;
  }
}

export default Activity;
