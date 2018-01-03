import {
  GraphQLString as String,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
} from 'graphql';
import UserType from './UserType';
import User from '../models/User';

const Request = new ObjectType({
  name: 'Request',
  fields: {
    id: {
      type: ID,
    },
    type: {
      type: String,
    },

    content: {
      type: String,
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
        return User.gen(viewer, parent.processorId, loaders);
      },
    },
    deniedAt: {
      type: String,
    },
    createdAt: {
      type: String,
    },
    updatedAt: {
      type: String,
    },
  },
});

export default Request;
