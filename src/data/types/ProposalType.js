import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
} from 'graphql';
import AuthorType from './AuthorType';
import StatementType from './StatementType';
import QuorumType from './QuorumType';
import TagType from './TagType';
import VoteInfoType from './VoteInfoType';
import PollType from './PollType';

const ProposalType = new ObjectType({
  name: 'Proposal',
  sqlTable: 'proposals', // the SQL table for this object type is called "accounts"
  uniqueKey: 'id',
  args: {
    userID: {
      description: 'The proposals ID number',
      type: GraphQLInt,
    },
  },
  fields: {
    id: { type: new NonNull(ID) },
    author: {
      type: AuthorType,
      sqlJoin(proposalsTable, usersTable) {
        return `${proposalsTable}.author_id = ${usersTable}.id`;
      },
    },
    quorum: {
      type: QuorumType,
      sqlJoin(proposalsTable, quorumsTable) {
        return `${proposalsTable}.quorum_id = ${quorumsTable}.id`;
      },
    },
    body: {
      type: GraphQLString,
      sqlColumn: 'body',
    },
    title: {
      type: GraphQLString,
    },
    tags: {
      type: new GraphQLList(TagType),
      joinTable: 'proposal_tags',
      sqlJoins: [
        (proposalTable, proposalTagsTable) => `${proposalTable}.id = ${proposalTagsTable}.proposal_id`,
        (proposalTagsTable, tagsTable) => `${proposalTagsTable}.tag_id = ${tagsTable}.id`,
      ],
    },
    pollOne: {
      type: PollType,
      sqlJoin(proposalsTable, pollsTabel) {
        return `${proposalsTable}.poll_one_id = ${pollsTabel}.id`;
      },
    },
    pollTwo: {
      type: PollType,
      sqlJoin(proposalsTable, pollsTabel) {
        return `${proposalsTable}.poll_two_id = ${pollsTabel}.id`;
      },
    },

    statements: {
      type: new GraphQLList(StatementType),
      sqlJoin(proposalsTable, statementsTable) {
        return `${proposalsTable}.id = ${statementsTable}.proposal_id`;
      },
    },
    state: {
      type: GraphQLString,
    },
    votes: {
      type: GraphQLInt,
    },
    starts: {
      type: GraphQLString,
      sqlColumn: 'vote_started_at',
    },
    ends: {
      type: GraphQLString,
      sqlColumn: 'vote_ends_at',
    },
    vote: {
      type: new GraphQLList(VoteInfoType),
      sqlJoin(proposalsTable, votesTable, args, context) {
        if (context.args && context.args.userID) {
          return `${proposalsTable}.id = ${votesTable}.proposal_id and ${votesTable}.user_id = any(select followee_id from user_follows where user_follows.follower_id = ${context.args.userID} union all select ${context.args.userID})`;
        }
        return `${proposalsTable}.id = ${votesTable}.proposal_id`;
      },

/*   resolve(table, args,context,other){
        return new Promise( (resolve,reject) => {
          knex('votes').where({user_id: context.args.userID, proposal_id: context.args.id})
          .then((data) => {console.log(data);if(data[0]){resolve(data[0])}else{resolve();}});
        })
      }
      */

    },

  },

});
export default ProposalType;
