import { GraphQLUnionType } from 'graphql';
import ProposalType from './ProposalDLType';
import Proposal from '../models/Proposal';
import StatementType from './StatementDLType';
import Statement from '../models/Statement';
import VoteType from './VoteDLType';
import Vote from '../models/Vote';

const ObjectType = new GraphQLUnionType({
  name: 'FeedObject',

  types: [ProposalType, StatementType, VoteType],
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
    return null;
  },
});
export default ObjectType;
