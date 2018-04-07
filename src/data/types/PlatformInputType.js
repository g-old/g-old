import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
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
    email: {
      type: String,
    },
    goldMode: {
      type: GraphQLBoolean,
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
