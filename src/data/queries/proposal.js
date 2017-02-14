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
      description: 'The users ID number',
      type: GraphQLInt,
    },
  },
  where: (proposalsTable, args, context) => { // eslint-disable-line no-unused-vars
    if (args.id) return `${proposalsTable}.id = ${args.id}`;
    return null;
  },
  resolve: (parent, args, context, resolveInfo) => joinMonster(resolveInfo, context, sql => {
    if (context) {
            // context.set('X-SQL-Preview', sql.replace(/\n/g, '%0A'))
    }
    return knex.raw(sql).then(result => result);
  }, options),
};

export default proposal;
