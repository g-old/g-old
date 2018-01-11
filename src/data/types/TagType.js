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
    displayName: {
      type: GraphQLString,
      resolve(parent, args, params, { rootValue }) {
        switch (rootValue.request.language) {
          case 'de-DE': {
            return parent.deName || parent.text;
          }
          case 'it-IT': {
            return parent.itName || parent.text;
          }
          case 'lld-IT': {
            return parent.lldName || parent.text;
          }

          default:
            return parent.text;
        }
      },
    },
    deName: {
      type: GraphQLString,
    },
    itName: {
      type: GraphQLString,
    },
    lldName: {
      type: GraphQLString,
    },
    count: {
      type: GraphQLInt,
    },
  },
});
export default TagType;
