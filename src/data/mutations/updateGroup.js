import { GraphQLNonNull } from 'graphql';
import GroupInput from '../types/GroupInputType';
import GroupType from '../types/GroupType';
import Group from '../models/Group';

const updateGroup = {
  type: new GraphQLNonNull(GroupType),
  args: {
    group: {
      type: GroupInput,
      description: 'Update group',
    },
  },
  resolve: async (data, { group }, { viewer, loaders }) => {
    const newGroup = await Group.update(viewer, group, loaders);
    return newGroup;
  },
};

export default updateGroup;
