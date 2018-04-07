import { GraphQLID } from 'graphql';

import AssetType from '../types/AssetType';
import Asset from '../models/Asset';

const asset = {
  type: AssetType,
  args: {
    id: {
      type: GraphQLID,
    },
  },
  resolve: (parent, { id }, { viewer, loaders }) =>
    Asset.gen(viewer, id, loaders),
};

export default asset;
