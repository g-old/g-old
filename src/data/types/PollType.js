import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
} from 'graphql';

import PollingModeType from './PollingModeType';
import VoteType from './VoteType';
import StatementType from './StatementType';

const PollType = new ObjectType({
  name: 'Poll',
  sqlTable: 'polls', // the SQL table for this object type is called "accounts"
  uniqueKey: 'id',
  fields: {
    id: { type: new NonNull(ID) },
    secret: {
      type: GraphQLBoolean,
    },
    threshold: {
      type: GraphQLInt,
    },
    end_time: {
      type: GraphQLString,
    },
    start_time: {
      type: GraphQLString,
    },
    closed_at: {
      type: GraphQLString,
    },
    mode: {
      type: PollingModeType,
      sqlJoin(pollsTable, pollingModesTable) {
        return `${pollsTable}.polling_mode_id = ${pollingModesTable}.id`;
      },
    },
    votes: {
      type: new GraphQLList(VoteType),
      sqlJoin(pollsTable, votesTable) {
        return `${pollsTable}.id = ${votesTable}.poll_id`;
      },
    },
    allVoters: {
      type: GraphQLInt,
      sqlColumn: 'num_voter',
    },
    upvotes: {
      type: GraphQLInt,
    },
    downvotes: {
      type: GraphQLInt,
    },
    followees: {
      type: new GraphQLList(VoteType),
      description: 'Votings of followees',
      sqlJoin(pollsTable, votesTable, args, context) {
        if (context.args && context.args.userID) {
          return `${pollsTable}.id = ${votesTable}.poll_id and ${votesTable}.user_id = any(select followee_id from user_follows where user_follows.follower_id = ${context.args.userID} union all select ${context.args.userID})`;
        }
        return `${pollsTable}.id = ${votesTable}.poll_id`;
      },
    },
    statements: {
      type: new GraphQLList(StatementType),
      sqlJoin(pollsTable, statementsTable) {
        return `${pollsTable}.id = ${statementsTable}.poll_id`;
      },

    },
    createdAt: {
      type: GraphQLString,
      sqlColumn: 'created_at',
    },


  },

});
export default PollType;
