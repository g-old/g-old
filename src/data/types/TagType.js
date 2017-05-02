import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLInt,
} from 'graphql';

const TagType = new ObjectType({
  name: 'Tag',
  fields: {
    id: { type: new NonNull(ID) },
    text: {
      type: GraphQLString,
    },
    count: {
      type: GraphQLInt,
    },
    createdAt: {
      type: GraphQLString,
    },
  },
});
export default TagType;
