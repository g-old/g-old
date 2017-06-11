import { GraphQLInt, GraphQLString } from 'graphql';

import PageType from '../types/PageType';
import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';
import knex from '../knex';

const proposal = {
  type: PageType(ProposalType),
  args: {
    first: {
      type: GraphQLInt,
    },
    after: {
      type: GraphQLString,
    },
    state: {
      type: GraphQLString,
    },
  },
  resolve: async (parent, { first = 10, after = '', state }, { viewer, loaders }) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    // cursor = cursor ? new Date(cursor) : new Date();
    let [cursor = null, offset = 0] = pagination ? pagination.split('$') : [];
    offset = Number(offset);
    let proposals = [];

    switch (state) {
      case 'active': {
        cursor = cursor ? new Date(cursor) : new Date(null);
        proposals = await knex('proposals')
          .innerJoin('polls', function () {
            this.on(function () {
              this.on(
                knex.raw(
                  "(proposals.state = 'proposed' and proposals.poll_one_id = polls.id) or proposals.state = 'voting' and proposals.poll_two_id = polls.id",
                ),
              );
            });
          })
          .where({ 'polls.closed_at': null })
          .where('polls.end_time', '>=', cursor)
          .limit(first)
          .offset(offset)
          .orderBy('polls.end_time', 'asc')
          .select('proposals.id as id', 'polls.end_time as time');
        break;
      }

      case 'accepted': {
        cursor = cursor ? new Date(cursor) : new Date();
        proposals = await knex('proposals')
          .innerJoin('polls', function () {
            this.on(function () {
              this.on(
                knex.raw('coalesce (proposals.poll_two_id, proposals.poll_one_id) = polls.id'),
              );
            });
          })
          .where('proposals.state', '=', 'accepted')
          .where('polls.end_time', '<=', cursor)
          .limit(first)
          .offset(offset)
          .orderBy('polls.end_time', 'desc')
          .select('proposals.id as id', 'polls.closed_at as time');
        break;
      }

      case 'repelled': {
        cursor = cursor ? new Date(cursor) : new Date();

        proposals = await knex('proposals')
          .innerJoin('polls', function () {
            this.on(function () {
              this.on(
                knex.raw(
                  "(proposals.state = 'revoked' and proposals.poll_one_id = polls.id) or proposals.state = 'rejected' and proposals.poll_two_id = polls.id",
                ),
              );
            });
          })
          .where('polls.closed_at', '<=', new Date(cursor))
          .limit(first)
          .offset(offset)
          .orderBy('polls.closed_at', 'desc')
          .select('proposals.id as id', 'polls.closed_at as time');
        break;
      }
      default:
        throw Error(`State not recognized: ${state}`);
    }

    const queries = proposals.map(p => Proposal.gen(viewer, p.id, loaders));
    const proposalsSet = proposals.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    const endCursor = edges.length > 0
      ? Buffer.from(
          `${new Date(
            proposalsSet[edges[edges.length - 1].node.id].time,
          ).toJSON()}$${edges.length}`,
        ).toString('base64')
      : null;

    const hasNextPage = edges.length === first;
    return {
      edges,
      pageInfo: {
        startCursor: null,
        endCursor,
        hasNextPage,
      },
    };
  },
};

export default proposal;
