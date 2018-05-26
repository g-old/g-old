import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType as ObjectType,
} from 'graphql';
import CategoryTypeEnum from './CategoryTypeEnum';
import TranslationType from './TranslationType';

const localeMapper = { 'de-DE': 'de', 'it-IT': 'it', 'lld-IT': 'lld' };

const NoteType = new ObjectType({
  name: 'Note',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    textHtml: {
      type: TranslationType,
    },

    content: {
      type: GraphQLString,
      resolve: (parent, args, params, { rootValue }) => {
        const locale = rootValue.request.language;
        if (parent.textHtml[localeMapper[locale]]) {
          return parent.textHtml[localeMapper[locale]];
        }
        // find one translation that is not emty or default translation
        return Object.keys(parent.textHtml).find(l => parent.textHtml[l]);
      },
    },
    category: {
      type: CategoryTypeEnum,
    },
    keyword: {
      type: GraphQLString,
    },

    createdAt: {
      type: GraphQLString,
    },
  }),
});
export default NoteType;
