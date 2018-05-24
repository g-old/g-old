import { GraphQLUnionType } from 'graphql';
import Note from '../models/Note';
import NoteType from './NoteType';

const MessageObjectType = new GraphQLUnionType({
  name: 'MessageObject',

  types: () => [NoteType],
  resolveType: value => {
    if (value instanceof Note) {
      return NoteType;
    }

    return null;
  },
});
export default MessageObjectType;
