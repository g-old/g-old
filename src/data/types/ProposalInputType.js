import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLList,
} from 'graphql';
import PollInput from './PollInputType';
import TagInputType from './TagInputType';

const ProposalInputType = new GraphQLInputObjectType({
  name: 'ProposalInput',
  fields: {
    pollingModeId: {
      type: ID,
    },
    poll: {
      type: PollInput,
    },
    text: {
      type: String,
    },
    title: {
      type: String,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    modeId: {
      type: ID,
    },
    tags: {
      type: new GraphQLList(TagInputType),
    },
    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default ProposalInputType;
