import { GraphQLUnionType } from 'graphql';
import ProposalType from './ProposalDLType';
import Proposal from '../models/Proposal';
import StatementType from './StatementDLType';
import Statement from '../models/Statement';
import VoteType from './VoteDLType';
import Vote from '../models/Vote';
import MessageType from './MessageType';
import Message from '../models/Message';
import DiscussionType from './DiscussionType';
import Discussion from '../models/Discussion';
import CommentType from './CommentType';
import Comment from '../models/Comment';
import RequestType from './RequestType';
import Request from '../models/Request';
import UserType from './UserType';
import User from '../models/User';

const ObjectType = new GraphQLUnionType({
  name: 'FeedObject',

  types: () => [
    ProposalType,
    StatementType,
    VoteType,
    MessageType,
    DiscussionType,
    CommentType,
    RequestType,
    UserType,
  ],
  resolveType: value => {
    if (value instanceof Proposal) {
      return ProposalType;
    }
    if (value instanceof Statement) {
      return StatementType;
    }
    if (value instanceof Vote) {
      return VoteType;
    }

    if (value instanceof Message) {
      return MessageType;
    }
    if (value instanceof Discussion) {
      return DiscussionType;
    }
    if (value instanceof Comment) {
      return CommentType;
    }
    if (value instanceof Request) {
      return RequestType;
    }
    if (value instanceof User) {
      return UserType;
    }
    return null;
  },
});
export default ObjectType;
