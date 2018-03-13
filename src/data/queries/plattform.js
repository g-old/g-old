import PlattformType from '../types/PlattformType';
import Plattform from '../models/Plattform';

const plattform = {
  type: PlattformType,

  resolve: (parent, args, { viewer, loaders }) =>
    Plattform.gen(viewer, loaders),
};

export default plattform;
