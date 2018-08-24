import { GraphQLInputObjectType, GraphQLID, GraphQLEnumType } from 'graphql';

const VerbTypeEnum = new GraphQLEnumType({
  name: 'VerbTypeEnum',
  values: {
    CREATE: {
      value: 'create',
    },
    DELETE: {
      value: 'delete',
    },
    UPDATE: {
      value: 'update',
    },
    REJECT: {
      value: 'reject',
    },
    ACCEPT: {
      value: 'accept',
    },
    CLOSE: {
      value: 'close',
    },
  },
});

const ActivityTypeEnum = new GraphQLEnumType({
  name: 'ActivityTypeEnum',
  values: {
    PROPOSAL: {
      value: 'proposal',
    },
    STATEMENT: {
      value: 'statement',
    },
    POLL: {
      value: 'poll',
    },
    LIKE: {
      value: 'like',
    },
    MESSAGE: {
      value: 'message',
    },
    DISCUSSION: {
      value: 'discussion',
    },
    COMMENT: {
      value: 'comment',
    },
    REQUEST: {
      value: 'request',
    },
    SURVEY: {
      value: 'survey',
    },
    USER: {
      value: 'user',
    },
  },
});

const ActivityFilterType = new GraphQLInputObjectType({
  name: 'ActivityFilter',
  fields: {
    actorId: {
      type: GraphQLID,
    },
    verb: {
      type: VerbTypeEnum,
    },
    type: {
      type: ActivityTypeEnum,
    },
    objectId: {
      type: GraphQLID,
    },
  },
});

export default ActivityFilterType;
