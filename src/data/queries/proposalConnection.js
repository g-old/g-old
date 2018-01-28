import { GraphQLInt, GraphQLString, GraphQLID } from 'graphql';

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
    tagId: {
      type: GraphQLID,
    },
    workTeamId: {
      type: GraphQLID,
    },
  },
  resolve: async (
    parent,
    { first = 10, after = '', state, tagId, workTeamId },
    { viewer, loaders },
  ) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    // cursor = cursor ? new Date(cursor) : new Date();
    let [cursor = null, id = 0] = pagination ? pagination.split('$') : [];
    id = Number(id);
    let proposals = [];

    if (tagId) {
      cursor = cursor ? new Date(cursor) : new Date();
      /*
      select proposals.id from proposals join (select proposal_tags.proposal_id from proposal_tags where proposal_tags.tag_id =5)as tt on proposals.id = tt.proposal_id;

      */
      proposals = await knex(
        knex.raw(
          'proposals join (select proposal_tags.proposal_id from proposal_tags where proposal_tags.tag_id = ?)as tt on proposals.id = tt.proposal_id',
          [tagId],
        ),
      )
        .where({ work_team_id: workTeamId || null })
        .whereRaw('(proposals.created_at, proposals.id) < (?,?)', [cursor, id])
        .limit(first)
        .orderBy('proposals.created_at', 'desc')
        .orderBy('proposals.id', 'desc')
        .select('proposals.id as id', 'proposals.created_at as time');
    } else {
      switch (state) {
        case 'active': {
          cursor = cursor ? new Date(cursor) : new Date(null);
          proposals = await knex('proposals')
            .innerJoin('polls', function() {
              this.on(function() {
                this.on(
                  knex.raw(
                    "(proposals.state = 'proposed' and proposals.poll_one_id = polls.id) or proposals.state = 'voting' and proposals.poll_two_id = polls.id",
                  ),
                );
              });
            })
            //  .where({ 'polls.closed_at': null }) TODO find some other way to p1 to p2 transitioning
            .where({ work_team_id: workTeamId || null })
            .whereRaw('(polls.end_time, polls.id) > (?,?)', [cursor, id])
            .limit(first)
            .orderBy('polls.end_time', 'asc')
            .orderBy('polls.id', 'asc')
            .select('proposals.id as id', 'polls.end_time as time');

          break;
        }

        case 'accepted': {
          cursor = cursor ? new Date(cursor) : new Date();
          proposals = await knex('proposals')
            .innerJoin('polls', function() {
              this.on(function() {
                this.on(
                  knex.raw(
                    'coalesce (proposals.poll_two_id, proposals.poll_one_id) = polls.id',
                  ),
                );
              });
            })
            .where({ work_team_id: workTeamId || null })
            .where('proposals.state', '=', 'accepted')
            .whereRaw('(polls.end_time, polls.id) < (?,?)', [cursor, id])
            .limit(first)
            .orderBy('polls.end_time', 'desc')
            .select('proposals.id as id', 'polls.closed_at as time');
          break;
        }

        case 'repelled': {
          cursor = cursor ? new Date(cursor) : new Date();

          proposals = await knex('proposals')
            .innerJoin('polls', function() {
              this.on(function() {
                this.on(
                  knex.raw(
                    "(proposals.state = 'revoked' and proposals.poll_one_id = polls.id) or proposals.state = 'rejected' and proposals.poll_two_id = polls.id",
                  ),
                );
              });
            })
            .where({ work_team_id: workTeamId || null })
            .whereRaw('(polls.closed_at, polls.id) < (?,?)', [cursor, id])
            .limit(first)
            .orderBy('polls.closed_at', 'desc')
            .select('proposals.id as id', 'polls.closed_at as time');
          break;
        }
        case 'survey': {
          cursor = cursor ? new Date(cursor) : new Date(null);
          proposals = await knex('proposals')
            .innerJoin('polls', 'proposals.poll_one_id', 'polls.id')
            .where({ work_team_id: workTeamId || null })
            .where('proposals.state', '=', 'survey')
            .whereRaw('(polls.end_time, polls.id) > (?,?)', [cursor, id])
            .limit(first)
            .orderBy('polls.end_time', 'asc')
            .select('proposals.id as id', 'polls.end_time as time');
          break;
        }
        case 'pending': {
          // Hack to load relevant proposals for mainteam - all accepted proposals of other workteams
          cursor = cursor ? new Date(cursor) : new Date();

          proposals = await knex('proposals')
            .innerJoin('polls', function() {
              this.on(function() {
                this.on(
                  knex.raw(
                    'coalesce (proposals.poll_two_id, proposals.poll_one_id) = polls.id',
                  ),
                );
              });
            })
            .whereNot({ work_team_id: workTeamId })
            .whereNotNull('work_team_id')
            .where('proposals.state', '=', 'accepted')
            .whereRaw('(polls.end_time, polls.id) < (?,?)', [cursor, id])
            .limit(first)
            .orderBy('polls.end_time', 'desc')
            .select('proposals.id as id', 'polls.closed_at as time');
          break;
        }
        default:
          throw Error(`State not recognized: ${state}`);
      }
    }

    const queries = proposals.map(p => Proposal.gen(viewer, p.id, loaders));
    const proposalsSet = proposals.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    const endCursor =
      edges.length > 0
        ? Buffer.from(
            `${new Date(
              proposalsSet[edges[edges.length - 1].node.id].time,
            ).toJSON()}$${edges[edges.length - 1].node.id}`,
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
