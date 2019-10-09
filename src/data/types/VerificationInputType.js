import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';
import VerificationTypeEnum from './VerificationStatusEnum';

const VerificationInputType = new GraphQLInputObjectType({
  name: 'VerificationInput',
  fields: {
    filePath: {
      type: GraphQLString,
    },
    status: {
      type: VerificationTypeEnum,
    },

    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default VerificationInputType;
