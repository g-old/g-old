import { GraphQLNonNull } from 'graphql';
import DiscussionInputType from '../types/DiscussionInputType';
import DiscussionType from '../types/DiscussionType';
import Discussion from '../models/Discussion';

const updateDiscussion = {
  type: new GraphQLNonNull(DiscussionType),
  args: {
    discussion: {
      type: DiscussionInputType,
    },
  },
  resolve: async (data, { discussion }, { viewer, loaders }) => {
    const updatedDiscussion = await Discussion.update(
      viewer,
      discussion,
      loaders,
    );

    return updatedDiscussion;
  },
};

export default updateDiscussion;
