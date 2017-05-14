import { GraphQLList } from 'graphql';

import PollingModeType from '../types/PollingModeDLType';
import PollingMode from '../models/PollingMode';
import knex from '../knex';

const pollingModes = {
  type: new GraphQLList(PollingModeType),

  resolve: (parent, args, { viewer, loaders }) =>
    knex('polling_modes')
      .pluck('id')
      .then(pMIds => pMIds.map(id => PollingMode.gen(viewer, id, loaders))),
};

export default pollingModes;
