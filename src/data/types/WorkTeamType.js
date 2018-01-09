import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';
import UserType from './UserType';
import DiscussionType from './DiscussionType';
import GroupStatusType from './GroupStatusType';
import Request from '../models/Request';
import RequestType from '../types/RequestType';
import Discussion from '../models/Discussion';
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
    requests: {
      type: new GraphQLList(RequestType),
      async resolve(parent, args, { viewer, loaders }) {
        const requests = await knex('requests')
          .where({ type: 'joinWT' })
          .whereRaw("content->>'id' = ?", [parent.id])
          .pluck('id');
        return requests.map(id => Request.gen(viewer, id, loaders));
      },
    },
    numMembers: {
      type: GraphQLInt,
    },
    numDiscussions: {
      type: GraphQLInt,
    },
    discussions: {
      type: new GraphQLList(DiscussionType),
      resolve(data, args, { viewer, loaders }) {
        if (viewer && viewer.wtMemberships.includes(data.id)) {
          return knex('discussions')
            .where({ work_team_id: data.id })
            .pluck('id')
            .then(ids => ids.map(id => Discussion.gen(viewer, id, loaders)));
        }
        return null;
      },
    },
  }),
});
export default WorkTeamType;
