import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
} from 'graphql';

const RoleType = new ObjectType({
  name: 'Role',

  fields: {
    id: { type: new NonNull(ID) },
    type: {
      type: GraphQLString,
    },
  },
});
export default RoleType;
