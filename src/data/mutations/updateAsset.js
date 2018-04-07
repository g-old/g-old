import { GraphQLNonNull } from 'graphql';
import AssetInput from '../types/AssetInputType';
import AssetType from '../types/AssetType';
import Asset from '../models/Asset';

const updateAsset = {
  type: new GraphQLNonNull(AssetType),
  args: {
    asset: {
      type: AssetInput,
      description: 'Update asset',
    },
  },
  resolve: async (data, { asset }, { viewer, loaders }) => {
    const newAsset = await Asset.update(viewer, asset, loaders);
    return newAsset;
  },
};

export default updateAsset;
