import { GraphQLString as String, GraphQLInputObjectType, GraphQLID as ID } from 'graphql';

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

    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default UserInputType;
