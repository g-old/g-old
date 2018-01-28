// from https://github.com/graphql/graphql-relay-js/blob/master/src/connection/connection.js

/* eslint-disable import/prefer-default-export */
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

function resolveMaybeThunk(thingOrThunk) {
  return typeof thingOrThunk === 'function' ? thingOrThunk() : thingOrThunk;
}

const pageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: () => ({
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating forwards, are there more items?',
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating backwards, are there more items?',
    },
    startCursor: {
      type: GraphQLString,
      description: 'When paginating backwards, the cursor to continue.',
    },
    endCursor: {
      type: GraphQLString,
      description: 'When paginating forwards, the cursor to continue.',
    },
  }),
});

const forwardConnectionArgs = {
  after: {
    type: GraphQLString,
  },
  first: {
    type: GraphQLInt,
  },
};

const backwardConnectionArgs = {
  before: {
    type: GraphQLString,
  },
  last: {
    type: GraphQLInt,
  },
};
export const connectionArgs = {
  ...forwardConnectionArgs,
  ...backwardConnectionArgs,
};

export function connectionDefinitions(config) {
  const resolveNode = config.resolveNode;
  const edgeFields = config.edgeFields || {};
  const connectionFields = config.connectionFields || {};
  const resolveCursor = config.resolveCursor;
  const edgeType = new GraphQLObjectType({
    name: `${config.name}Edge`,
    description: 'An edge in a connection.',
    fields: () => ({
      node: {
        type: config.nodeType,
        resolve: resolveNode,
        description: 'The item at the end of the edge',
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: resolveCursor,
        description: 'A cursor for use in pagination',
      },
      ...resolveMaybeThunk(edgeFields),
    }),
  });
  const connectionType = new GraphQLObjectType({
    name: `${config.name}Connection`,
    fields: () => ({
      pageInfo: {
        type: new GraphQLNonNull(pageInfoType),
        description: 'Information to aid in pagination.',
      },
      edges: {
        type: new GraphQLList(edgeType),
        description: 'A list of edges.',
      },
      ...resolveMaybeThunk(connectionFields),
    }),
  });

  return { edgeType, connectionType };
}
