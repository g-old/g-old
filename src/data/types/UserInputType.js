import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLInt,
} from 'graphql';

const UserInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    roleId: {
      type: GraphQLInt,
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

    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default UserInputType;
