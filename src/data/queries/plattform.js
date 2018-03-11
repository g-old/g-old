import { GraphQLID } from 'graphql';

import PlattformType from '../types/PlattformType';
import Plattform from '../models/Plattform';

const plattform = {
  type: PlattformType,
  args: {
    id: {
      type: GraphQLID,
    },
  },
  resolve: (parent, { id }, { viewer, loaders }) =>
    Plattform.gen(viewer, id, loaders),
};

export default plattform;
