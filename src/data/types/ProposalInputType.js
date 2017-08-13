import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLList,
  GraphQLEnumType,
} from 'graphql';
import PollInput from './PollInputType';
import TagInputType from './TagInputType';

const ProposalInputType = new GraphQLInputObjectType({
  name: 'ProposalInput',
  fields: {
    poll: {
      type: PollInput,
    },
    text: {
      type: String,
    },
    title: {
      type: String,
    },
    state: {
      type: new GraphQLEnumType({
        name: 'ProposalState',
        values: {
          revoked: {
            value: 'revoked',
            description: 'Revoke the proposal',
          },
          accepted: {
            value: 'accepted',
            description: 'Close the poll',
          },
          survey: {
            value: 'survey',
            description: 'Open survey',
          },
        },
      }),
    },
    tags: {
      type: new GraphQLList(TagInputType),
    },
    spokesmanId: {
      type: ID,
    },
    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default ProposalInputType;
