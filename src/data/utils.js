/* eslint-disable import/prefer-default-export */
import { GraphQLInt, GraphQLString } from 'graphql';

import PageType from './types/PageType';

const extractCursors = opaqueCursor => {
  let cursorData;
  if (opaqueCursor) {
    cursorData = Buffer.from(opaqueCursor, 'base64')
      .toString('ascii')
      .split('$');
  } else {
    cursorData = [new Date(), 0];
  }
  return cursorData;
};

export const createConnection = (
  resultType,
  resultModel,
  resolverFn,
  additionalArgs = {},
) => ({
  type: PageType(resultType),
  args: {
    first: { type: GraphQLInt },
    after: { type: GraphQLString },
    ...additionalArgs,
  },
  resolve: async (parent, args, { viewer, loaders }) => {
    const first = args.first || 10;
    const after = args.after || '';
    const [cursorDate, cursorId] = extractCursors(after);
    const data = await resolverFn(
      viewer,
      { cursorDate, cursorId, batchSize: first },
      args,
    );

    const queries = data.map(p => resultModel.gen(viewer, p.id, loaders));
    const dataSet = data.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    const results = await Promise.all(queries);
    const edges = results.map(p => ({ node: p }));
    const endCursor =
      edges.length > 0
        ? Buffer.from(
            `${new Date(
              dataSet[edges[edges.length - 1].node.id].time,
            ).toJSON()}$${edges[edges.length - 1].node.id}`,
          ).toString('base64')
        : null;

    const hasNextPage = edges.length === first;
    return { edges, pageInfo: { startCursor: null, endCursor, hasNextPage } };
  },
});
