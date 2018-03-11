import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';

const PlattformInputType = new GraphQLInputObjectType({
  name: 'PlattformInput',
  fields: {
    id: {
      type: ID,
    },
    name: {
      type: String,
    },
    adminId: {
      type: ID,
    },
    about: {
      type: String,
    },
    defaultGroupId: {
      type: ID,
    },
  },
});
export default PlattformInputType;
