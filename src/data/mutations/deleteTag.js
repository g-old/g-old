import { GraphQLNonNull } from 'graphql';
import TagInput from '../types/TagInputType';
import TagType from '../types/TagType';
import Tag from '../models/Tag';

const deleteTag = {
  type: new GraphQLNonNull(TagType),
  args: {
    tag: {
      type: TagInput,
      description: 'Delete tag',
    },
  },
  resolve: async (data, { tag }, { viewer, loaders }) => {
    const newTag = await Tag.delete(viewer, tag, loaders);
    return newTag;
  },
};

export default deleteTag;
