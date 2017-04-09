import { GraphQLNonNull, GraphQLString } from 'graphql';
import AvatarInputType from '../types/AvatarInputType';

const uploadAvatar = {
  type: new GraphQLNonNull(GraphQLString),
  args: {
    avatar: {
      type: AvatarInputType,
    },
  },
  /*
  See https://github.com/graphql/express-graphql/blob/master/src/__tests__/http-test.js#L461
    For fileuploads of ordinary files
    Use multer!
  */
  resolve() {
    throw Error();
  },
};

export default uploadAvatar;
