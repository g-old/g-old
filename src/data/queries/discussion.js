import { GraphQLID } from 'graphql';

import DiscussionType from '../types/DiscussionType';
import Discussion from '../models/Discussion';

const discussion = {
  type: DiscussionType,
  args: {
    id: {
      type: GraphQLID,
    },
  },
  resolve: (parent, { id }, { viewer, loaders }) =>
    Discussion.gen(viewer, id, loaders),
};

export default discussion;
