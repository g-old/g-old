import { GraphQLInputObjectType, GraphQLID as ID } from 'graphql';

const AssetInputType = new GraphQLInputObjectType({
  name: 'AssetInput',
  fields: {
    id: {
      type: ID,
    },
  },
});
export default AssetInputType;
