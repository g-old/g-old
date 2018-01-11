import { GraphQLList } from 'graphql';

import TagType from '../types/TagType';
import Tag from '../models/Tag';
import knex from '../knex';

const tags = {
  type: new GraphQLList(TagType),

  resolve: (parent, args, { viewer, loaders }) =>
    knex('tags')
      .pluck('id')
      .then(tagIds => tagIds.map(tId => Tag.gen(viewer, tId, loaders))),
};

export default tags;
