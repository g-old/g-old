import { GraphQLNonNull } from 'graphql';
import RequestInput from '../types/RequestInputType';
import RequestResultType from '../types/RequestResultType';
import Request from '../models/Request';

const createRequest = {
  type: new GraphQLNonNull(RequestResultType),
  args: {
    request: {
      type: RequestInput,
      description: 'Create a new request',
    },
  },
  resolve: async (data, { request }, { viewer, loaders }) => {
    const requestResult = await Request.create(
      viewer,
      request,
      loaders,
      data.request,
    );
    return requestResult;
  },
};

export default createRequest;
