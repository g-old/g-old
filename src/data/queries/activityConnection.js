import ActivityType from '../types/ActivityType';
import ActivityFilterType from '../types/ActivityFilterType';

import Activity from '../models/Activity';
import knex from '../knex';
import { createConnection } from '../utils';
import { isAdmin } from '../../organization';

const allActivities = createConnection(
  ActivityType,
  Activity,
  async (viewer, { cursorDate, cursorId, batchSize }, args) =>
    isAdmin(viewer)
      ? knex('activities')
          .whereRaw('(activities.created_at, activities.id) < (?,?)', [
            cursorDate,
            cursorId,
          ])
          .modify(queryBuilder => {
            if (!args.filterBy) return;
            const clause = {};
            if (args.filterBy.actorId) {
              clause.actor_id = args.filterBy.actorId;
            }
            if (args.filterBy.objectId) {
              clause.object_id = args.filterBy.objectId;
            }
            if (args.filterBy.verb) {
              clause.verb = args.filterBy.verb;
            }
            if (args.filterBy.type) {
              clause.type = args.filterBy.type;
            }
            queryBuilder.where(clause);
          })
          .limit(batchSize)
          .orderBy('activities.created_at', 'desc')
          .orderBy('activities.id', 'desc')
          .select('activities.id as id', 'activities.created_at as time')
      : Promise.resolve([]),
  {
    filterBy: {
      type: ActivityFilterType,
    },
  },
);

export default allActivities;
