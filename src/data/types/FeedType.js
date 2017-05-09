import { GraphQLString, GraphQLObjectType, GraphQLID, GraphQLNonNull } from 'graphql';
import User from '../models/User';
import UserType from './UserType';
import ObjectType from './ObjectType';

const FeedType = new GraphQLObjectType({
  name: 'Feed',

  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    // not sure if this is the right way as we have to make a system user
    actor: {
      type: UserType,
      resolve: (parent, { id }, { viewer, loaders }) => User.gen(viewer, parent.userId, loaders),
    },
    object: {
      type: ObjectType,
    },
    createdAt: {
      type: GraphQLString,
    },
  },
});
export default FeedType;
