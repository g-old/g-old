import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
  GraphQLObjectType as ObjectType,
} from 'graphql';
import CategoryTypeEnum from './CategoryTypeEnum';
import TranslationType from './TranslationType';
import GraphQLDate from './GraphQLDateType';

const localeMapper = { 'de-DE': 'de', 'it-IT': 'it', 'lld-IT': 'lld' };

const NoteType = new ObjectType({
  name: 'Note',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    isPublished: {
      type: GraphQLBoolean,
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
        return Object.values(parent.textHtml).find(t => t);
      },
    },
    category: {
      type: CategoryTypeEnum,
    },
    keyword: {
      type: GraphQLString,
    },

    createdAt: {
      type: GraphQLDate,
    },
    updatedAt: {
      type: GraphQLDate,
    },
  }),
});
export default NoteType;
