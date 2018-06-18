import { GraphQLNonNull } from 'graphql';
import DiscussionInputType from '../types/DiscussionInputType';
import DiscussionType from '../types/DiscussionType';
import Discussion from '../models/Discussion';

const updateDiscussion = {
  type: new GraphQLNonNull(DiscussionType),
  args: {
    comment: {
      type: DiscussionInputType,
    },
  },
  resolve: async (data, { comment }, { viewer, loaders }) => {
    const updatedDiscussion = await Discussion.update(viewer, comment, loaders);

    return updatedDiscussion;
  },
};

export default updateDiscussion;
