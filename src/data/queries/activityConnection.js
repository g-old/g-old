import ActivityType from '../types/ActivityType';
import ActivityFilterType from '../types/ActivityFilterType';

import Activity from '../models/Activity';
import knex from '../knex';
import { createConnection } from '../utils';

const allActivities = createConnection(
  ActivityType,
  Activity,
  async (cursorDate, cursorId, batchSize, args) =>
    knex('activities')
      .whereRaw('(activities.created_at, activities.id) < (?,?)', [
        cursorDate,
        cursorId,
      ])
      .modify(queryBuilder => {
        if (!args.filterBy) return;
        const clause = {};
        if (args.actorId) {
          clause.actor_id = args.actorId;
        }
        if (args.objectId) {
          clause.object_id = args.objectId;
        }
        if (args.verb) {
          clause.verb = args.verb;
        }
        if (args.type) {
          clause.verb = args.verb;
        }
        queryBuilder.where(clause);
      })
      .limit(batchSize)
      .orderBy('activities.created_at', 'desc')
      .orderBy('activities.id', 'desc')
      .select('activities.id as id', 'activities.created_at as time'),
  {
    filterBy: {
      type: ActivityFilterType,
    },
  },
);

export default allActivities;
