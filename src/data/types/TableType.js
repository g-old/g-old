import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType as ObjectType,
} from 'graphql';

const TableType = new ObjectType({
  name: 'TableType',

  fields: {
    table: {
      type: GraphQLString,
      resolve(data) {
        return data.relname;
      },
    },
    indexUsage: {
      type: GraphQLInt,
      resolve(data) {
        return data.percent_of_times_index_used;
      },
    },
    numRows: {
      type: GraphQLInt,
      resolve(data) {
        return data.rows_in_table;
      },
    },
  },
});
export default TableType;
