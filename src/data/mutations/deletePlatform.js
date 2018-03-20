import { GraphQLNonNull } from 'graphql';
import PlatformInput from '../types/PlatformInputType';
import PlatformType from '../types/PlatformType';
import Platform from '../models/Platform';

const deletePlatform = {
  type: new GraphQLNonNull(PlatformType),
  args: {
    platform: {
      type: PlatformInput,
      description: 'Delete platform',
    },
  },
  resolve: async (data, { platform }, { viewer, loaders }) => {
    const newPlatform = await Platform.delete(viewer, platform, loaders);
    return newPlatform;
  },
};

export default deletePlatform;
