import { GraphQLNonNull } from 'graphql';
import DiscussionInput from '../types/DiscussionInputType';
import DiscussionType from '../types/DiscussionType';
import Discussion from '../models/Discussion';
// import { sendJob } from '../../core/childProcess';
// import log from '../../logger';
// import { insertIntoFeed } from '../../core/feed';

const createDiscussion = {
  type: new GraphQLNonNull(DiscussionType),
  args: {
    discussion: {
      type: DiscussionInput,
      description: 'Create a new discussion',
    },
  },
  resolve: async (data, { discussion }, { viewer, loaders }) => {
    const newDiscussion = await Discussion.create(viewer, discussion, loaders);
    // TODO when refactoring feed gen - create activity in D.create method
    /*
    if (newDiscussion) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: {
            type: 'discussion',
            content: newDiscussion,
            objectId: newDiscussion.id,
          },
          verb: 'create',
        },
        true,
      );
      if (activityId) {
        pubsub.publish('activities', { id: activityId });
      }
      if (!sendJob({ type: 'webpush', data: newDiscussion })) {
        log.error(
          { viewer, job: { type: 'webpush', data: newDiscussion } },
          'Could not send job to worker',
        );
      }
    }
*/
    return newDiscussion;
  },
};

export default createDiscussion;
