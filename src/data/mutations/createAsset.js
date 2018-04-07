import { GraphQLNonNull } from 'graphql';
import AssetInput from '../types/AssetInputType';
import AssetType from '../types/AssetType';
import Asset from '../models/Asset';

const createAsset = {
  type: new GraphQLNonNull(AssetType),
  args: {
    asset: {
      type: AssetInput,
      description: 'Create a new asset',
    },
  },
  resolve: async (data, { asset }, { viewer, loaders }) => {
    const newAsset = await Asset.create(viewer, asset, loaders);
    return newAsset;
  },
};

export default createAsset;
