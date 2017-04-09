import { GraphQLString, GraphQLInputObjectType } from 'graphql';

const AvatarInputType = new GraphQLInputObjectType({
  name: 'Avatar',
  fields: {
    originalName: {
      type: GraphQLString,
    },
    mimeType: {
      type: GraphQLString,
    },
    dataUrl: {
      type: GraphQLString,
    },
  },
});
export default AvatarInputType;
