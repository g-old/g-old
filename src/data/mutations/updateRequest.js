import { GraphQLNonNull } from 'graphql';
import RequestInput from '../types/RequestInputType';
import RequestType from '../types/RequestType';
import Request from '../models/Request';

const updateRequest = {
  type: new GraphQLNonNull(RequestType),
  args: {
    request: {
      type: RequestInput,
      description: 'Update request',
    },
  },
  resolve: async (data, { request }, { viewer, loaders }) => {
    const newRequest = await Request.update(viewer, request, loaders);
    return newRequest;
  },
};

export default updateRequest;
