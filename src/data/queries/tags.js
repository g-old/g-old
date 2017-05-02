import { GraphQLList } from 'graphql';

import TagType from '../types/TagType';
import knex from '../knex';

const tags = {
  type: new GraphQLList(TagType),

  resolve: (parent, args, { loaders }) =>
    knex('tags').pluck('id').then(tagIds => tagIds.map(tId => loaders.tags.load(tId))),
};

export default tags;
