import {
  GraphQLInt,
} from 'graphql';
import joinMonster from 'join-monster';
import ProposalType from '../types/ProposalType';
import knex from '../knex';


const options = {
  minify: process.env.MINIFY === 1,
};


const proposal = {
  type: ProposalType,
  args: {
    id: {
      description: 'The proposals ID number',
      type: GraphQLInt,
    },
    userID: {
      description: 'The users ID number',
      type: GraphQLInt,
    },
  },
  where: (proposalsTable, args, context) => { // eslint-disable-line no-unused-vars
    context.args = args; // eslint-disable-line no-param-reassign

    if (args.id) {
      return `${proposalsTable}.id = ${args.id} `;
    }
    return null;
  },
  resolve: (parent, args, context, resolveInfo) =>
    joinMonster(resolveInfo, context, sql =>
      knex.raw(sql).then(result => result),
   options),
};

export default proposal;
