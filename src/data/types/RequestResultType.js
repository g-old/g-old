import {
  GraphQLString as String,
  GraphQLObjectType as ObjectType,
  GraphQLList,
} from 'graphql';
import RequestType from './RequestType';

const RequestResultType = new ObjectType({
  name: 'RequestResult',
  fields: () => ({
    errors: {
      type: new GraphQLList(String),
    },
    result: {
      type: RequestType,
    },
  }),
});

export default RequestResultType;
