import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
} from 'graphql';

import OptionInputType from './OptionInputType';
import PollingModeInput from './PollingModeInputType';

const PollInputType = new GraphQLInputObjectType({
  name: 'PollInput',
  fields: {
    secret: {
      type: GraphQLBoolean,
    },
    threshold: {
      type: GraphQLInt,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    mode: {
      type: PollingModeInput,
    },
    options: {
      type: new GraphQLList(OptionInputType),
    },

    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default PollInputType;
