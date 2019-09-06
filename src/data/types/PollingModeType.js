import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';
import GraphQLDate from './GraphQLDateType';

const PollingModeType = new ObjectType({
  name: 'PollingMode',
  sqlTable: 'polling_modes', // the SQL table for this object type is called "accounts"
  uniqueKey: 'id',
  fields: {
    id: { type: new NonNull(ID) },
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
export default PollingModeType;
