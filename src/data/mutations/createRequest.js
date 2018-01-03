import { GraphQLNonNull } from 'graphql';
import RequestInput from '../types/RequestInputType';
import RequestType from '../types/RequestType';
import Request from '../models/Request';

const createRequest = {
  type: new GraphQLNonNull(RequestType),
  args: {
    request: {
      type: RequestInput,
      description: 'Create a new request',
    },
  },
  resolve: async (data, { request }, { viewer, loaders }) => {
    const newRequest = await Request.create(viewer, request, loaders);
    return newRequest;
  },
};

export default createRequest;
