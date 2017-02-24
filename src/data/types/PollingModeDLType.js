import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';


const PollingModeDLType = new ObjectType({
  name: 'PollingModeDL',
  fields: {
    id: { type: ID },
    with_statements: {
      type: GraphQLBoolean,
    },
    unipolar: {
      type: GraphQLBoolean,
    },
    threshold_ref: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },

    createdAt: {
      type: GraphQLString,
      sqlColumn: 'created_at',
    },


  },

});
export default PollingModeDLType;
