import { GraphQLUnionType } from 'graphql';
import Note from '../models/Note';
import NoteType from './NoteType';
import Communication from '../models/Communication';
import CommunicationType from './CommunicationType';

const MessageObjectType = new GraphQLUnionType({
  name: 'MessageObject',

  types: () => [NoteType],
  resolveType: value => {
    if (value instanceof Note) {
      return NoteType;
    }
    if (value instanceof Communication) {
      return CommunicationType;
    }

    return null;
  },
});
export default MessageObjectType;
