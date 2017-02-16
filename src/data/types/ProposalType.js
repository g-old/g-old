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
    text: {
      type: GraphQLString,
      sqlColumn: 'body',
    },
    title: {
      type: GraphQLString,
    },
    tags: {
      type: new GraphQLList(TagType),
      sqlJoin(proposalsTable, proposalTagsTable) {
        return `${proposalsTable}.id = ${proposalTagsTable}.proposal_id`;
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
        return `${proposalsTable}.id = ${votesTable}.proposal_id and ${votesTable}.user_id = ${context.args.userID} `;
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
