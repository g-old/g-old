import { GraphQLList } from 'graphql';
import knex from '../knex';

import WorkTeamType from '../types/WorkTeamType';
import WorkTeam from '../models/WorkTeam';

const workTeams = {
  type: new GraphQLList(WorkTeamType),

  resolve: (root, args, { viewer, loaders }) =>
    knex('work_teams').pluck('id').then(ids => ids.map(id => WorkTeam.gen(viewer, id, loaders))),
};

export default workTeams;
