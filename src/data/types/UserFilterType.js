import { GraphQLInputObjectType, GraphQLInt, GraphQLString } from 'graphql';
import VerificationStatusTypeEnum from './VerificationStatusEnum';

const UserFilterType = new GraphQLInputObjectType({
  name: 'UserFilter',
  fields: {
    groups: {
      type: GraphQLInt,
    },
    verificationStatus: {
      type: VerificationStatusTypeEnum,
    },
    fileId: {
      type: GraphQLString,
    },
  },
});

export default UserFilterType;
