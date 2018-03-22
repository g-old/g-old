import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';
import GroupType from './GroupType';
import Group from '../models/Group';

const PollingModeType = new ObjectType({
  name: 'PollingMode',
  fields: () => ({
    id: { type: new NonNull(ID) },
    withStatements: {
      type: GraphQLBoolean,
    },
    unipolar: {
      type: GraphQLBoolean,
    },
    names: {
      type: GraphQLString,
      resolve: parent => JSON.stringify(parent.names),
    },

    displayName: {
      type: GraphQLString,
      resolve(parent, args, params, { rootValue }) {
        const locale = rootValue.request.language;
        return parent.names[locale] || parent.names.default_name;
      },
    },
    owner: {
      type: GroupType,
      resolve(data, args, { viewer, loaders }) {
        return Group.gen(viewer, data.ownerId, loaders);
      },
    },
    inheritable: {
      type: GraphQLBoolean,
    },
    thresholdRef: {
      type: GraphQLString,
    },

    description: {
      type: GraphQLString,
    },

    createdAt: {
      type: GraphQLString,
    },
    updatedAt: {
      type: GraphQLString,
    },
  }),
});
export default PollingModeType;
