import { GraphQLUnionType } from 'graphql';
import ProposalType from './ProposalDLType';
import Proposal from '../models/Proposal';
import StatementType from './StatementDLType';
import Statement from '../models/Statement';
import VoteType from './VoteDLType';
import Vote from '../models/Vote';
import NotificationType from './NotificationType';
import Notification from '../models/Notification';

const ObjectType = new GraphQLUnionType({
  name: 'FeedObject',

  types: [ProposalType, StatementType, VoteType, NotificationType],
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
    return null;
  },
});
export default ObjectType;
