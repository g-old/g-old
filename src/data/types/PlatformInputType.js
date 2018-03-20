import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';

const PlatformInputType = new GraphQLInputObjectType({
  name: 'PlatformInput',
  fields: {
    id: {
      type: ID,
    },
    names: {
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
export default PlatformInputType;
