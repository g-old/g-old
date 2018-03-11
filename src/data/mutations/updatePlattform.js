import { GraphQLNonNull } from 'graphql';
import PlattformInput from '../types/PlattformInputType';
import PlattformType from '../types/PlattformType';
import Plattform from '../models/Plattform';

const updatePlattform = {
  type: new GraphQLNonNull(PlattformType),
  args: {
    plattform: {
      type: PlattformInput,
      description: 'Update plattform',
    },
  },
  resolve: async (data, { plattform }, { viewer, loaders }) => {
    const newPlattform = await Plattform.update(viewer, plattform, loaders);
    return newPlattform;
  },
};

export default updatePlattform;
