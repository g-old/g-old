import {
  GraphQLEnumType,
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';

const FlaggedStatementInputType = new GraphQLInputObjectType({
  name: 'FlaggedStatementInput',
  fields: {
    flaggerId: {
      type: ID,
    },
    statementId: {
      type: ID,
    },
    flaggedId: {
      type: ID,
      description: 'ID of the flagged user',
    },
    content: {
      type: String,
    },
    solverId: {
      type: ID,
    },
    action: {
      type: new GraphQLEnumType({
        name: 'action',
        values: {
          delete: {
            value: 'delete',
          },
          reject: {
            value: 'reject',
          },
        },
      }),
    },
    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default FlaggedStatementInputType;
