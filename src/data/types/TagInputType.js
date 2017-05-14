import { GraphQLID as ID, GraphQLInputObjectType, GraphQLString } from 'graphql';

const TagInputType = new GraphQLInputObjectType({
  name: 'TagInput',

  fields: {
    text: {
      type: GraphQLString,
    },
    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default TagInputType;
