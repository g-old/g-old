import { GraphQLNonNull } from 'graphql';
import TagInput from '../types/TagInputType';
import TagType from '../types/TagType';
import Tag from '../models/Tag';

const createTag = {
  type: new GraphQLNonNull(TagType),
  args: {
    tag: {
      type: TagInput,
      description: 'Create a new tag',
    },
  },
  resolve: async (data, { tag }, { viewer, loaders }) => {
    const newTag = await Tag.create(viewer, tag, loaders);
    return newTag;
  },
};

export default createTag;
