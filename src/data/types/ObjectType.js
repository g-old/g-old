import { GraphQLUnionType } from 'graphql';
import ProposalType, { type tProposalType } from './ProposalDLType';
import Proposal from '../models/Proposal';
import StatementType, { type tStatementType } from './StatementDLType';
import Statement from '../models/Statement';
import VoteType, { type tVoteType } from './VoteDLType';
import Vote from '../models/Vote';
import NotificationType, { type tNotificationType } from './NotificationType';
import Notification from '../models/Notification';
import DiscussionType, { type tDiscussionType } from './DiscussionType';
import Discussion from '../models/Discussion';
import CommentType, { type tCommentType } from './CommentType';
import Comment from '../models/Comment';
import RequestType, { type tRequestType } from './RequestType';
import Request from '../models/Request';

export type tObjectType =
  | tProposalType
  | tStatementType
  | tVoteType
  | tNotificationType
  | tDiscussionType
  | tCommentType
  | tRequestType;

// @flow
const ObjectType = new GraphQLUnionType({
  name: 'FeedObject',

  types: [
    ProposalType,
    StatementType,
    VoteType,
    NotificationType,
    DiscussionType,
    CommentType,
    RequestType,
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
    if (value instanceof Discussion) {
      return DiscussionType;
    }
    if (value instanceof Comment) {
      return CommentType;
    }
    if (value instanceof Request) {
      return RequestType;
    }
    return null;
  },
});
export default ObjectType;
