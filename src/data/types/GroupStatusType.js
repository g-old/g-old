import { GraphQLObjectType as ObjectType } from 'graphql';
import StatusType from './StatusType';
import RequestType from './RequestType';

const GroupStatusType = new ObjectType({
  name: 'GroupStatus',
  fields: () => ({
    status: {
      type: StatusType,
    },
    request: {
      type: RequestType,
    },
  }),
});

export default GroupStatusType;
