import {
  GraphQLString,
  GraphQLList,
} from 'graphql';
import joinMonster from 'join-monster';
import ProposalType from '../types/ProposalType';
import knex from '../knex';


const options = {
  minify: process.env.MINIFY === 1,
};


const proposals = {
  type: new GraphQLList(ProposalType),
  args: {
    state: {
      description: 'The proposals state',
      type: GraphQLString,
    },
  },
  where: (proposalsTable, args, context) => { // eslint-disable-line no-unused-vars
    if (args.state) return `${proposalsTable}.state = '${args.state}'`;
    return null;
  },
  resolve: (parent, args, context, resolveInfo) => joinMonster(
    resolveInfo, context, sql => knex.raw(sql)
  .then(result => result), options),
};

export default proposals;
