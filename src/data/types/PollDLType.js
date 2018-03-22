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
import VoteType from './VoteDLType';
import StatementType from './StatementDLType';
import Statement from '../models/Statement';
import StatementLikeType from './StatementLikeType';
import StatementLike from '../models/StatementLike';
import Vote from '../models/Vote';
import knex from '../knex';
import PollingMode from '../models/PollingMode';

const PollType = new ObjectType({
  name: 'PollDL',
  fields: () => ({
    id: { type: new NonNull(ID) },
    secret: {
      type: GraphQLBoolean,
    },
    threshold: {
      type: GraphQLInt,
    },
    endTime: {
      type: GraphQLString,
    },
    start_time: {
      type: GraphQLString,
    },
    closedAt: {
      type: GraphQLString,
    },
    mode: {
      type: PollingModeType,
      resolve: (data, args, { viewer, loaders }) =>
        PollingMode.gen(viewer, data.pollingModeId, loaders),
    },
    ownVote: {
      type: VoteType,
      resolve(data, args, { viewer, loaders }) {
        return Promise.resolve(
          knex('votes')
            .where({ user_id: viewer.id, poll_id: data.id })
            .pluck('id')
            .then(id => (id[0] ? Vote.gen(viewer, id[0], loaders) : null)),
        );
      },
    },
    likedStatements: {
      type: new GraphQLList(StatementLikeType),

      resolve(data, args, { viewer, loaders }) {
        return Promise.resolve(
          knex('statement_likes')
            .where('statement_likes.user_id', '=', viewer.id)
            .join(
              'statements',
              'statements.id',
              '=',
              'statement_likes.statement_id',
            )
            .where('statements.poll_id', '=', data.id)
            .pluck('statement_likes.id')
            .then(ids => ids.map(id => StatementLike.gen(viewer, id, loaders))),
        );
      },
    },

    votes: {
      type: new GraphQLList(VoteType),
      resolve(data, args, { viewer, loaders }) {
        return Promise.resolve(
          knex('votes')
            .where({ poll_id: data.id })
            .pluck('votes.id')
            .then(ids => ids.map(id => Vote.gen(viewer, id, loaders))),
        );
      },
    },
    allVoters: {
      type: GraphQLInt,
      resolve: data => data.numVoter,
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
      resolve(data, args, { viewer, loaders }) {
        return Promise.resolve(
          knex('user_follows')
            .where({ follower_id: viewer.id })
            .join('votes', 'user_follows.followee_id', '=', 'votes.user_id')
            .where('votes.poll_id', '=', data.id)
            .pluck('votes.id')
            .then(ids => ids.map(id => Vote.gen(viewer, id, loaders))),
        );

        /*
       return Promise.resolve(
        User.followees(viewer.id, loaders)
        .then(ids => ids.map(id => User.vote(id, data.id, loaders).then(voteID =>
        {console.log('POLL.VOTEID');
        if(voteID && voteID.length > 0) return Vote.gen(viewer, voteID[0].id, loaders)} )))
      ); */
      },
    },
    statements: {
      type: new GraphQLList(StatementType),
      resolve: (data, args, { viewer, loaders }) =>
        Promise.resolve(
          knex('statements')
            .where({ poll_id: data.id })
            .pluck('id')
            .then(ids => ids.map(id => Statement.gen(viewer, id, loaders))),
        ),
    },
    ownStatement: {
      type: StatementType,
      resolve(data, args, { viewer, loaders }) {
        return Promise.resolve(
          knex('statements')
            .where({ poll_id: data.id, author_id: viewer.id })
            .pluck('id')
            .then(id => (id[0] ? Statement.gen(viewer, id[0], loaders) : null)),
        );
      },
    },

    createdAt: {
      type: GraphQLString,
    },
  }),
});
export default PollType;
