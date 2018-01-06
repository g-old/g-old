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
      type: GraphQLString,
      async resolve(parent, args, { viewer }) {
        let result = 'pending';
        if (viewer.wtMemberships.includes(parent.id)) {
          result = 'member';
        } else {
          const requests = await knex('requests')
            .where({ requester_id: viewer.id, type: 'joinWT' })
            .select(['content', 'denied_at']);
          const ownRequest = requests.find(r => {
            const c = JSON.parse(r.content);
            // eslint-disable-next-line
            if (c.id == parent.id) {
              return true;
            }
            return false;
          });

          if (ownRequest) {
            if (ownRequest.deniedAt) {
              result = 'denied';
            }
          } else {
            result = 'none';
          }
        }
        return result;
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
