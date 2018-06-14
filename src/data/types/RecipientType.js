import { GraphQLUnionType } from 'graphql';
import WorkTeamType from './WorkTeamType';
import WorkTeam from '../models/WorkTeam';
import UserType from './UserType';
import User from '../models/User';

const RecipientType = new GraphQLUnionType({
  name: 'RecipientType',

  types: () => [WorkTeamType, UserType],
  resolveType: value => {
    if (value instanceof WorkTeam) {
      return WorkTeamType;
    }
    if (value instanceof User) {
      return UserType;
    }

    return null;
  },
});
export default RecipientType;
