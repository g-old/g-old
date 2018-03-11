import { GraphQLNonNull } from 'graphql';
import PlattformInput from '../types/PlattformInputType';
import PlattformType from '../types/PlattformType';
import Plattform from '../models/Plattform';

const deletePlattform = {
  type: new GraphQLNonNull(PlattformType),
  args: {
    plattform: {
      type: PlattformInput,
      description: 'Delete plattform',
    },
  },
  resolve: async (data, { plattform }, { viewer, loaders }) => {
    const newPlattform = await Plattform.delete(viewer, plattform, loaders);
    return newPlattform;
  },
};

export default deletePlattform;
