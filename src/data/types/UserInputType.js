import {
  GraphQLString as String,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';

const UserInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    role: {
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
    privilege: {
      type: GraphQLInt,
    },

    followee: {
      type: ID,
    },

    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default UserInputType;
