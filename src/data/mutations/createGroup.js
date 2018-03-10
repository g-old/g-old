import { GraphQLNonNull } from 'graphql';
import GroupInputType from '../types/GroupInputType';
import Group from '../models/Group';
import GroupType from '../types/GroupType';

const createGroup = {
  type: new GraphQLNonNull(GroupType),
  args: {
    group: {
      type: GroupInputType,
    },
  },
  resolve: (data, { group }, { viewer, loaders }) =>
    Group.create(viewer, group, loaders),
};

export default createGroup;
