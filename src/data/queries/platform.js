import PlatformType from '../types/PlatformType';
import Platform from '../models/Platform';

const platform = {
  type: PlatformType,

  resolve: (parent, args, { viewer, loaders }) => Platform.gen(viewer, loaders),
};

export default platform;
