import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
  GraphQLEnumType,
} from 'graphql';

const PollingModeInputType = new GraphQLInputObjectType({
  name: 'PollingModeInput',
  fields: {
    withStatements: {
      type: GraphQLBoolean,
    },
    name: {
      type: String,
    },
    unipolar: {
      type: GraphQLBoolean,
    },
    thresholdRef: {
      type: new GraphQLEnumType({
        name: 'ThresholdReference',
        values: {
          all: {
            value: 'all',
            description: 'All potential voters are counted in for the threshold',
          },
          voters: {
            value: 'voters',
            description: 'Only effective voters are counted in for the threshold',
          },
        },
      }),
    },
    description: {
      type: String,
    },
    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default PollingModeInputType;
