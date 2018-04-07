import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';
import TagType from './TagType';
import PollType from './PollDLType';
import User from '../models/User';
import UserType from './UserType';
import Poll from '../models/Poll';
import Tag from '../models/Tag';

import knex from '../knex';
import { ProposalState } from '../models/Proposal';

// @flow
export type tProposalType = {
  __typename: 'ProposalDL',
  id: number,
  author: User,
  body: string,
  title: string,
  tags: TagType[],
  workTeamId: number,
  pollOne: PollType,
  pollTwo: PollType,
  activePoll: PollType,
  spokesman: UserType,
  state: string,
  votes: number,
  publishedAt: string,
  subscribed: boolean,
  canVote: boolean,
};

const ProposalType = new ObjectType({
  name: 'ProposalDL',
  /* args: {
    userID: {
      description: 'The proposals ID number',
      type: GraphQLInt,
    },
  }, */
  fields: () => ({
    id: { type: new NonNull(ID) },
    author: {
      type: UserType,
      resolve: (parent, args, { viewer, loaders }) =>
        User.gen(viewer, parent.author_id, loaders),
    },

    body: {
      type: GraphQLString,
    },
    title: {
      type: GraphQLString,
    },
    tags: {
      type: new GraphQLList(TagType),
      resolve: (data, args, { loaders, viewer }) =>
        Promise.resolve(
          knex('proposal_tags')
            .where({ proposal_id: data.id })
            .pluck('tag_id')
            .then(tagIds => tagIds.map(tId => Tag.gen(viewer, tId, loaders))),
        ),
    },
    workTeamId: {
      type: GraphQLString,
    },
    pollOne: {
      type: PollType,
      resolve: (parent, args, { viewer, loaders }) =>
        Poll.gen(viewer, parent.pollOne_id, loaders),
    },
    pollTwo: {
      type: PollType,
      resolve: (parent, args, { viewer, loaders }) =>
        Poll.gen(viewer, parent.pollTwo_id, loaders),
    },
    activePoll: {
      type: PollType,
      resolve: (parent, args, { viewer, loaders }) => {
        let pollId;
        switch (parent.state) {
          case ProposalState.SURVEY:
          case ProposalState.PROPOSED:
            pollId = parent.pollOne_id;
            break;
          case ProposalState.VOTING:
            pollId = parent.pollTwo_id;
            break;

          default:
            return null;
        }
        return Poll.gen(viewer, pollId, loaders);
      },
    },

    spokesman: {
      type: UserType,
      resolve: (parent, args, { viewer, loaders }) =>
        User.gen(viewer, parent.spokesmanId, loaders),
    },

    state: {
      type: GraphQLString,
    },
    votes: {
      type: GraphQLInt,
    },

    publishedAt: {
      type: GraphQLString,
      resolve: data => data.createdAt,
    },

    subscribed: {
      type: GraphQLBoolean,
      resolve: async (parent, args, { viewer }) => {
        const count = await knex('proposal_user_subscriptions')
          .where({
            user_id: viewer.id,
            proposal_id: parent.id,
          })
          .count('id');
        return count[0].count === '1';
      },
    },
    canVote: {
      type: GraphQLBoolean,
      resolve: async (parent, args, { viewer }) => parent.isVotable(viewer),
    },
  }),
});
export default ProposalType;
