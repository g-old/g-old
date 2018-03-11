import { GraphQLNonNull } from 'graphql';
import PlattformInput from '../types/PlattformInputType';
import PlattformType from '../types/PlattformType';
import Plattform from '../models/Plattform';

const createPlattform = {
  type: new GraphQLNonNull(PlattformType),
  args: {
    plattform: {
      type: PlattformInput,
      description: 'Create a new plattform',
    },
  },
  resolve: async (data, { plattform }, { viewer, loaders }) => {
    const newPlattform = await Plattform.create(viewer, plattform, loaders);
    return newPlattform;
  },
};

export default createPlattform;
