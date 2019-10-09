import { GraphQLEnumType } from 'graphql';
import { VerificationTypes } from '../models/constants';

const VerificationStatusEnumType = new GraphQLEnumType({
  name: 'VerificationStatusEnumType',
  values: {
    pending: {
      value: VerificationTypes.PENDING,
    },
    confirmed: {
      value: VerificationTypes.CONFIRMED,
    },
    denied: {
      value: VerificationTypes.DENIED,
    },
    unrequested: {
      value: VerificationTypes.UNREQUESTED,
    },
  },
});

export default VerificationStatusEnumType;
