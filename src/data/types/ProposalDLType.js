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
import PollType from './PollDLType';
import UserType from './UserType';
import SubscriptionType from './SubscriptionType';
import WorkTeamType from './WorkTeamType';
/* eslint-enable import/no-cycle */
import TagType from './TagType';
import User from '../models/User';
import Poll from '../models/Poll';
import Tag from '../models/Tag';
import Subscription from '../models/Subscription';
import { TargetType } from '../models/utils';
import knex from '../knex';
import WorkTeam from '../models/WorkTeam';
import GraphQLDate from './GraphQLDateType';

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
        User.gen(viewer, parent.authorId, loaders),
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
      type: ID,
    },
    workteam: {
      type: WorkTeamType,
      resolve: (parent, args, { viewer, loaders }) =>
        parent.workTeamId
          ? WorkTeam.gen(viewer, parent.workTeamId, loaders)
          : null,
    },
    pollOne: {
      type: PollType,
      resolve: (parent, args, { viewer, loaders }) =>
        Poll.gen(viewer, parent.pollOneId, loaders),
    },
    pollTwo: {
      type: PollType,
      resolve: (parent, args, { viewer, loaders }) =>
        Poll.gen(viewer, parent.pollTwoId, loaders),
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
      type: GraphQLDate,
      resolve: data => data.createdAt,
    },
    deletedAt: {
      type: GraphQLDate,
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

    subscription: {
      type: SubscriptionType,
      resolve: async (parent, args, { viewer, loaders }) =>
        knex('subscriptions')
          .where({
            target_id: parent.id,
            user_id: viewer.id,
            target_type: TargetType.PROPOSAL,
          })
          .pluck('id')
          .then(([id]) => Subscription.gen(viewer, id, loaders)),
    },
    canVote: {
      type: GraphQLBoolean,
      resolve: async (parent, args, { viewer }) =>
        parent.deletedAt ? false : parent.isVotable(viewer),
    },
  }),
});
export default ProposalType;
