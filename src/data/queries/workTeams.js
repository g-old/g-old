import { GraphQLList, GraphQLBoolean } from 'graphql';
import knex from '../knex';

import WorkTeamType from '../types/WorkTeamType';
import WorkTeam from '../models/WorkTeam';

const workTeams = {
  args: {
    active: {
      type: GraphQLBoolean,
    },
  },
  type: new GraphQLList(WorkTeamType),

  resolve: (root, args, { viewer, loaders }) =>
    knex('work_teams')
      .modify(queryBuilder => {
        if ('active' in args) {
          if (args.active) {
            queryBuilder.whereNull('deleted_at');
          } else {
            queryBuilder.whereNotNull('deleted_at');
          }
        }
      })
      .orderBy('created_at', 'desc')
      .pluck('id')
      .then(ids => ids.map(id => WorkTeam.gen(viewer, id, loaders))),
};

export default workTeams;
