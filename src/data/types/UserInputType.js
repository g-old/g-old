import {
  GraphQLString as String,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';
import VerificationInput from './VerificationInputType';

const UserInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    groups: {
      type: GraphQLInt,
    },
    locale: {
      type: String,
    },
    surname: {
      type: String,
    },
    name: {
      type: String,
    },

    email: {
      type: String, // TODO write custom EmailType
    },

    password: {
      type: String,
    },

    passwordOld: {
      type: String,
    },

    followee: {
      type: ID,
    },
    notificationSettings: {
      type: String,
    },
    verification: {
      type: VerificationInput,
    },

    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default UserInputType;
