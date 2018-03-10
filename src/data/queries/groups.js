import { GraphQLList } from 'graphql';
import knex from '../knex';

import GroupType from '../types/GroupType';
import Group from '../models/Group';

const groups = {
  type: new GraphQLList(GroupType),

  resolve: (root, args, { viewer, loaders }) =>
    knex('work_teams')
      .orderBy('created_at', 'desc')
      .pluck('id')
      .then(ids => ids.map(id => Group.gen(viewer, id, loaders))),
};

export default groups;
