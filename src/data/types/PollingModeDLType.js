import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';
import GraphQLDate from './GraphQLDateType';

const PollingModeDLType = new ObjectType({
  name: 'PollingModeDL',
  fields: {
    id: { type: ID },
    withStatements: {
      type: GraphQLBoolean,
    },
    unipolar: {
      type: GraphQLBoolean,
    },
    thresholdRef: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },

    createdAt: {
      type: GraphQLDate,
      sqlColumn: 'created_at',
    },
  },
});
export default PollingModeDLType;
