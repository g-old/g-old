// @flow

import { GraphQLObjectType, GraphQLID, GraphQLNonNull } from 'graphql';
import WorkTeam from '../models/WorkTeam';
import WorkTeamType, { type tWorkTeam } from './WorkTeamType';
import ObjectType, { type tObjectType } from './ObjectType';
import Proposal from '../models/Proposal';
import Discussion from '../models/Discussion';
import PostVerbType from './PostVerbType';
import Post from '../models/Post';
import { SubjectType } from '../models/Activity';

export type tPostType = {
  id: number,
  group: tWorkTeam,
  verb: tPostVerbType,
  subject: tObjectType,
};

const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'An element of the Feed.',

  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    group: {
      type: WorkTeamType,
      resolve: (parent: Post, args, { viewer, loaders }) =>
        WorkTeam.gen(viewer, parent.groupId, loaders),
    },

    verb: {
      type: PostVerbType,
    },

    subject: {
      type: ObjectType,
      resolve: (parent: Post, args, { viewer, loaders }) => {
        switch (parent.type) {
          case SubjectType.PROPOSAL:
            return Proposal.gen(viewer, parent.subjectId, loaders);
          case SubjectType.DISCUSSION:
            return Discussion.gen(viewer, parent.subjectId, loaders);

          default:
            return null;
        }
      },
    },
  },
});
export default PostType;
