import {
  GraphQLString as String,
  GraphQLObjectType as ObjectType,
} from 'graphql';
import UserType from './UserType';
import User from '../models/User';
import GroupType from './GroupType';
import Group from '../models/Group';

const PlattformType = new ObjectType({
  name: 'Plattform',
  fields: {
    names: {
      type: String,
      resolve: parent => JSON.stringify(parent.names),
    },

    displayName: {
      type: String,
      resolve(parent, args, params, { rootValue }) {
        const locale = rootValue.request.language;
        return parent.names[locale] || parent.names.default_name;
      },
    },
    picture: {
      type: String,
    },
    admin: {
      type: UserType,
      resolve(parent, args, { viewer, loaders }) {
        return User.gen(viewer, parent.adminId, loaders);
      },
    },
    defaultGroup: {
      type: GroupType,
      resolve(parent, args, { viewer, loaders }) {
        return Group.gen(viewer, parent.defaultGroupId, loaders);
      },
    },
  },
});

export default PlattformType;
