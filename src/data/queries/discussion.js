import { GraphQLID } from 'graphql';

import DiscussionType from '../types/DiscussionType';
import Discussion from '../models/Discussion';

const discussion = {
  type: DiscussionType,
  args: {
    id: {
      type: GraphQLID,
    },
    parentId: {
      type: GraphQLID,
    },
  },
  resolve: async (parent, { id, parentId }, { viewer, loaders }) => {
    const result = await Discussion.gen(viewer, id, loaders);
    result.parentId = parentId; // to pass args to subresolver
    return result;
  },
};

export default discussion;
