import { GraphQLNonNull } from 'graphql';
import TagInput from '../types/TagInputType';
import TagType from '../types/TagType';
import Tag from '../models/Tag';

const updateTag = {
  type: new GraphQLNonNull(TagType),
  args: {
    tag: {
      type: TagInput,
      description: 'Update tag',
    },
  },
  resolve: async (data, { tag }, { viewer, loaders }) => {
    const newTag = await Tag.update(viewer, tag, loaders);
    return newTag;
  },
};

export default updateTag;
