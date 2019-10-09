import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID,
} from 'graphql';
// eslint-disable-next-line import/no-cycle
import UserType from './UserType';

// eslint-disable-next-line import/no-self-import
import User from '../models/User';
import Date from './GraphQLDateType';
import VerificationStatus from './VerificationStatusEnum';

const VerificationType = new ObjectType({
  name: 'Verification',

  fields: () => ({
    id: {
      type: GraphQLID,
    },
    verificator: {
      type: UserType,
      resolve(parent, args, { viewer, loaders }) {
        return User.gen(viewer, parent.verificatorId, loaders);
      },
    },

    userId: {
      type: GraphQLID,
    },

    filePath: {
      type: GraphQLString,
    },
    status: {
      type: VerificationStatus,
    },
    idHash: {
      type: GraphQLString,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  }),
});
export default VerificationType;
