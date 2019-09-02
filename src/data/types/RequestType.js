import {
  GraphQLString as String,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLNonNull,
} from 'graphql';
import UserType from './UserType';
import User from '../models/User';
import GraphQLDate from './GraphQLDateType';

const Request = new ObjectType({
  name: 'Request',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(ID),
    },
    type: {
      type: String,
    },

    content: {
      type: String,
      resolve: parent =>
        parent.content ? JSON.stringify(parent.content) : null,
    },
    processor: {
      type: UserType,
      resolve(parent, args, { viewer, loaders }) {
        return User.gen(viewer, parent.processorId, loaders);
      },
    },
    requester: {
      type: UserType,
      resolve(parent, args, { viewer, loaders }) {
        return User.gen(viewer, parent.requesterId, loaders);
      },
    },
    deniedAt: {
      type: GraphQLDate,
    },
    createdAt: {
      type: GraphQLDate,
    },
    updatedAt: {
      type: GraphQLDate,
    },
  }),
});

export default Request;
