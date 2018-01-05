import { GraphQLNonNull } from 'graphql';
import RequestInput from '../types/RequestInputType';
import RequestType from '../types/RequestType';
import Request from '../models/Request';

const deleteRequest = {
  type: new GraphQLNonNull(RequestType),
  args: {
    request: {
      type: RequestInput,
      description: 'Create a new request',
    },
  },
  resolve: async (data, { request }, { viewer, loaders }) => {
    const deletedRequest = await Request.delete(viewer, request, loaders);
    return deletedRequest;
  },
};

export default deleteRequest;
