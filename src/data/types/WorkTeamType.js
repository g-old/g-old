import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
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
    numMembers: {
      type: GraphQLInt,
    },
    numDiscussions: {
      type: GraphQLInt,
    },
    discussions: {
      type: new GraphQLList(DiscussionType),
      resolve(data, args, { viewer, loaders }) {
        if (viewer) {
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
