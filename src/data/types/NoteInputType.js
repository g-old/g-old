import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID,
} from 'graphql';
import TranslationInputType from './TranslationInputType';
import CategoryTypeEnum from './CategoryTypeEnum';

const NoteInputType = new GraphQLInputObjectType({
  name: 'NoteInput',
  fields: {
    id: {
      type: GraphQLID,
    },

    textHtml: {
      type: TranslationInputType,
    },
    category: {
      type: CategoryTypeEnum,
    },
    keyword: {
      type: String,
    },
  },
});
export default NoteInputType;
