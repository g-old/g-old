import { GraphQLNonNull } from 'graphql';
import AssetInput from '../types/AssetInputType';
import AssetType from '../types/AssetType';
import Asset from '../models/Asset';

const deleteAsset = {
  type: new GraphQLNonNull(AssetType),
  args: {
    asset: {
      type: AssetInput,
      description: 'Delete asset',
    },
  },
  resolve: async (data, { asset }, { viewer, loaders }) => {
    const newAsset = await Asset.delete(viewer, asset, loaders);
    return newAsset;
  },
};

export default deleteAsset;
