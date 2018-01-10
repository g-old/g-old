import { GraphQLUnionType } from 'graphql';
import ProposalType from './ProposalDLType';
import Proposal from '../models/Proposal';
import StatementType from './StatementDLType';
import Statement from '../models/Statement';
import VoteType from './VoteDLType';
import Vote from '../models/Vote';
import NotificationType from './NotificationType';
import Notification from '../models/Notification';
import DiscussionType from './DiscussionType';
import Discussion from '../models/Discussion';
import CommentType from './CommentType';
import Comment from '../models/Comment';

const ObjectType = new GraphQLUnionType({
  name: 'FeedObject',

  types: [
    ProposalType,
    StatementType,
    VoteType,
    NotificationType,
    DiscussionType,
    CommentType,
  ],
  resolveType(value) {
    if (value instanceof Proposal) {
      return ProposalType;
    }
    if (value instanceof Statement) {
      return StatementType;
    }
    if (value instanceof Vote) {
      return VoteType;
    }
    if (value instanceof Notification) {
      return NotificationType;
    }
    if (value instanceof Notification) {
      return NotificationType;
    }
    if (value instanceof Discussion) {
      return DiscussionType;
    }
    if (value instanceof Comment) {
      return CommentType;
    }
    return null;
  },
});
export default ObjectType;
