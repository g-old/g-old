import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLInt,
} from 'graphql';
import UserType from './UserType';
import StatementType from './StatementDLType';
import Statement from '../models/Statement';
import User from '../models/User';

const FlaggedStatementType = new ObjectType({
  name: 'FlaggedStatement',
  fields: {
    id: { type: new NonNull(ID) },
    flagger: {
      type: new NonNull(UserType),
      resolve: (data, args, { viewer, loaders }) => User.gen(viewer, data.flagger_id, loaders),
    },
    statement: {
      type: StatementType,
      resolve: (data, args, { viewer, loaders }) =>
        Statement.gen(viewer, data.statement_id, loaders),
    },
    solver: {
      type: UserType,
      resolve: (data, args, { viewer, loaders }) => User.gen(viewer, data.solver_id, loaders),
    },
    flaggedUser: {
      type: UserType,
      resolve: (data, args, { viewer, loaders }) => User.gen(viewer, data.flagged_id, loaders),
    },
    content: {
      type: new NonNull(GraphQLString),
    },
    state: {
      type: GraphQLString,
    },
    count: {
      type: GraphQLInt,
      resolve: data => data.flag_count,
    },
    createdAt: {
      type: GraphQLString,
      resolve: data => data.created_at,
    },
    updatedAt: {
      type: GraphQLString,
      resolve: data => data.created_at,
    },
  },
});
export default FlaggedStatementType;
