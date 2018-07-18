/* eslint-disable import/prefer-default-export */
/* eslint-disable */
throw new Error('NOT FINISHED');
import { connectionDefinitions, connectionArgs } from './index';
import ressourceTypeToGraphQLType from './ressourceToType';

export function rootConnection(name, type) {
  const graphqlType = ressourceTypeToGraphQLType(type);
  const { connectionType } = connectionDefinitions({
    name,
    nodeType: graphqlType,
  });

  return {
    type: connectionType,
    args: connectionArgs,
    resolve: async (_, args) =>
      // TODO
      ({}),
  };
}
