import { GraphQLObjectType, GraphQLID, GraphQLNonNull } from 'graphql';
import WorkTeam from '../models/WorkTeam';
import WorkTeamType from './WorkTeamType';
import ObjectType from './ObjectType';
import Proposal from '../models/Proposal';
import Discussion from '../models/Discussion';
import PostVerbType from './PostVerbType';

const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'An element of the Feed.',

  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    group: {
      type: WorkTeamType,
      resolve: (parent, args, { viewer, loaders }) =>
        WorkTeam.gen(viewer, parent.groupId, loaders),
    },

    verb: {
      type: PostVerbType,
    },

    subject: {
      type: ObjectType,
      resolve: (parent, args, { viewer, loaders }) => {
        switch (parent.type) {
          case 'Proposal':
            return Proposal.gen(viewer, parent.subjectId, loaders);
          case 'Discussion':
            return Discussion.gen(viewer, parent.subjectId, loaders);

          default:
            return null;
        }
      },
    },
  },
});
export default PostType;
