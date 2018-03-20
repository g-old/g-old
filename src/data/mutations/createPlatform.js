import { GraphQLNonNull } from 'graphql';
import PlatformInput from '../types/PlatformInputType';
import PlatformType from '../types/PlatformType';
import Platform from '../models/Platform';

const createPlatform = {
  type: new GraphQLNonNull(PlatformType),
  args: {
    platform: {
      type: PlatformInput,
      description: 'Create a new platform',
    },
  },
  resolve: async (data, { platform }, { viewer, loaders }) => {
    const newPlatform = await Platform.create(viewer, platform, loaders);
    return newPlatform;
  },
};

export default createPlatform;
