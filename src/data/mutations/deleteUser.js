import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import UserType from '../types/UserType';
import UserInput from '../types/UserInputType';
import User from '../models/User';
import FileStorage, { AvatarManager } from '../../core/FileStorage';

const FileManager = FileStorage(AvatarManager({ local: !!__DEV__ }));

const deleteUser = {
  type: new GraphQLNonNull(
    new GraphQLObjectType({
      name: 'DeleteUserResult',
      fields: {
        errors: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
        user: { type: UserType },
      },
    }),
  ),
  args: {
    user: {
      // TODO Use UserInputType -solve problem with accessControl
      // (check num args and recognize that the operation is delete)
      type: UserInput,
    },
  },
  resolve: async (data, { user }, { viewer, loaders }) => {
    const deletedUserResult = await User.delete(viewer, user, loaders);
    if (deletedUserResult.user) {
      await FileManager.delete(
        { viewer, data: deletedUserResult.user },
        'images',
      );
      // TODO insert into activities
    }
    return deletedUserResult;
  },
};

export default deleteUser;
