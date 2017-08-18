import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLList,
} from 'graphql';
import UserType from './UserType';
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
  }),
});
export default WorkTeamType;
