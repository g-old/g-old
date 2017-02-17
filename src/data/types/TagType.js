import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLInt,
} from 'graphql';


const TagType = new ObjectType({
  name: 'Tag',
  sqlTable: 'tags', // the SQL table for this object type is called "accounts"
  uniqueKey: 'id',
  fields: {
    id: { type: new NonNull(ID) },
    text: {
      type: GraphQLString,
      sqlColumn: 'text',
    },
    count: {
      type: GraphQLInt,
      sqlColumn: 'count',
    },
    createdAt: {
      type: GraphQLString,
      sqlColumn: 'created_at',
    },


  },

});
export default TagType;
