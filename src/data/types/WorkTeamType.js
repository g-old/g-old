import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';
/* eslint-disable import/no-cycle */
import UserType from './UserType';
import GroupStatusType from './GroupStatusType';
import ProposalStatusType from './ProposalStatusType';
import requestConnection from '../queries/requestConnection';
import discussionConnection from '../queries/discussionConnection';
import proposalConnection from '../queries/proposalConnection';
/* eslint-enable import/no-cycle */

import PageType from './PageType';
import Request from '../models/Request';
import User from '../models/User';
import knex from '../knex';

const WorkTeamType = new ObjectType({
  name: 'WorkTeam',
  fields: () => ({
    id: { type: new NonNull(ID) },
    coordinator: {
      type: UserType,
      resolve(data, args, { viewer, loaders }) {
        return User.gen(viewer, data.coordinatorId, loaders);
      },
    },
    coordinatorId: {
      type: ID,
    },
    name: {
      type: GraphQLString,
    },
    displayName: {
      type: GraphQLString,
      resolve(parent, args, params, { rootValue }) {
        switch (rootValue.request.language) {
          case 'de-DE': {
            return parent.deName || parent.name;
          }
          case 'it-IT': {
            return parent.itName || parent.name;
          }
          case 'lld-IT': {
            return parent.lldName || parent.name;
          }

          default:
            return parent.name;
        }
      },
    },
    deName: {
      type: GraphQLString,
    },
    itName: {
      type: GraphQLString,
    },
    lldName: {
      type: GraphQLString,
    },
    members: {
      type: new GraphQLList(UserType),
      resolve(data, args, { viewer, loaders }) {
        if (viewer) {
          return knex('user_work_teams')
            .where({ work_team_id: data.id })
            .pluck('user_id')
            .then(ids => ids.map(id => User.gen(viewer, id, loaders)));
        }
        return null;
      },
    },
    restricted: {
      type: GraphQLBoolean,
    },
    mainTeam: {
      type: GraphQLBoolean,
    },
    logo: {
      type: GraphQLString,
    },
    background: {
      type: GraphQLString,
    },
    ownStatus: {
      type: GroupStatusType,
      async resolve(parent, args, { viewer }) {
        if (viewer.wtMemberships.includes(parent.id)) {
          return { status: 1 };
        }
        const [membership = null] = await knex('user_work_teams')
          .where({ work_team_id: parent.id, user_id: viewer.id })
          .pluck('id');
        if (!membership) {
          const requests = await knex('requests')
            .where({ requester_id: viewer.id, type: 'joinWT' })
            .whereRaw("content->>'id' = ?", [parent.id])
            .select('*');
          if (requests.length) {
            const req = requests.find(r => r.denied_at);

            if (req) {
              return { status: 2, request: new Request(req) };
            }
            return { status: 2, request: new Request(requests[0]) };
          }
        }
        return { status: 0 };
      },
    },
    /* requests: {
      type: new GraphQLList(RequestType),
      async resolve(parent, args, { viewer, loaders }) {
        const requests = await knex('requests')
          .where({ type: 'joinWT' })
          .whereRaw("content->>'id' = ?", [parent.id])
          .pluck('id');
        return requests.map(id => Request.gen(viewer, id, loaders));
      },
    }, */
    requestConnection,
    numMembers: {
      type: GraphQLInt,
    },
    numDiscussions: {
      type: GraphQLInt,
    },
    numProposals: {
      type: GraphQLInt,
    },
    deletedAt: {
      type: GraphQLString,
    },
    discussionConnection,

    proposalConnection,

    // TODO see https://github.com/graphql/swapi-graphql/blob/master/src/schema/connections.js
    // make own query and link here
    linkedProposalConnection: {
      type: PageType(ProposalStatusType),
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
      async resolve(parent, { first = 10, after = '', state }) {
        const pagination = Buffer.from(after, 'base64').toString('ascii');
        // cursor = cursor ? new Date(cursor) : new Date();
        let [cursor = null, id = 0] = pagination ? pagination.split('$') : [];
        id = Number(id);
        let proposalStates = [];
        cursor = cursor ? new Date(cursor) : new Date(null);
        proposalStates = await knex('proposal_groups')
          .where({
            group_id: parent.id,
            group_type: 'WT',
          })
          .modify(queryBuilder => {
            if (state) {
              queryBuilder.where({ state });
            }
          })
          .whereRaw(
            '(proposal_groups.created_at, proposal_groups.id) > (?,?)',
            [cursor, id],
          )
          .limit(first)
          .orderBy('proposal_groups.created_at', 'asc')
          .orderBy('proposal_groups.id', 'asc')
          .select();

        const proposalsSet = proposalStates.reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {});
        const data = proposalStates;
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
    },
  }),
});
export default WorkTeamType;
