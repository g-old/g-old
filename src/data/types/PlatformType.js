import {
  GraphQLBoolean,
  GraphQLString as String,
  GraphQLObjectType as ObjectType,
  GraphQLList,
} from 'graphql';
import knex from '../knex';
import UserType from './UserType';
import User from '../models/User';
import GroupType from './GroupType';
import Group from '../models/Group';

const PlatformType = new ObjectType({
  name: 'Platform',
  fields: () => ({
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
    goldMode: {
      type: GraphQLBoolean,
    },
    email: {
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
    mainGroups: {
      type: new GraphQLList(GroupType),
      resolve(parent, args, { viewer, loaders }) {
        if (viewer) {
          return knex('groups')
            .whereNull('parent_group_id')
            .pluck('id')
            .then(ids => ids.map(id => Group.gen(viewer, id, loaders)));
        }
        return [];
      },
    },
  }),
});

export default PlatformType;
