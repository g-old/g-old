import knex from '../knex';
import { canMutate, Models } from '../../core/accessControl';
import { dedup } from '../../core/helpers';
import { transactify } from './utils';

const ErrorCodes = {
  NO_ARGS: 1,
  WRONG_ARGS: 2,
};
const NUM_MAX_TAGS = 8;
class Tag {
  constructor(data) {
    this.id = data.id;
    this.text = data.text;
    this.deName = data.de_name;
    this.itName = data.it_name;
    this.lldName = data.lld_name;
    this.count = data.count;
  }

  static async gen(viewer, id, { tags }) {
    const data = await tags.load(id);
    return data ? new Tag(data) : null;
  }

  static async create(viewer, data, trx) {
    if (!data || !data.text) return null;
    if (!canMutate(viewer, data, Models.TAG)) return null;

    const newData = {
      text: data.text,
      ...(data.deName && { de_name: data.deName }),
      ...(data.itName && { it_name: data.itName }),
      ...(data.lldName && { lld_name: data.lldName }),
    };

    if (data.count) {
      newData.count = data.count;
    }

    const createTag = async transaction => {
      const [tag = null] = await knex('tags')
        .transacting(transaction)
        .insert(newData)
        .returning('*');

      return tag;
    };

    const tagInDB = await transactify(createTag, knex, trx);
    return tagInDB ? new Tag(tagInDB) : null;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.TAG)) return null;
    const newData = {};
    if ('text' in data) {
      newData.text = data.text;
    }
    if ('deName' in data) {
      newData.de_name = data.deName;
    }
    if ('itName' in data) {
      newData.it_name = data.itName;
    }
    if ('lldName' in data) {
      newData.lld_name = data.lldName;
    }

    const updatedTag = await knex.transaction(async trx => {
      const [tag = null] = await knex('tags')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      return tag;
    });

    return updatedTag ? new Tag(updatedTag) : null;
  }

  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.TAG)) return null;
    await knex.transaction(async trx => {
      await knex('tags')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();

      await knex('proposal_tags')
        .where({ tag_id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();
    });

    return new Tag({ id: data.id });
  }

  static async addTagsToProposal(viewer, { proposal, tags }, trx) {
    if (tags) {
      const { existingTags, newTags, error } = await Tag.matchTags(tags);

      if (error) {
        throw new Error(error);
      }

      let tagsByProposal = [];
      if (existingTags && existingTags.length) {
        tagsByProposal = [
          ...tagsByProposal,
          ...existingTags.map(tag => ({
            proposal_id: proposal.id,
            tag_id: tag.id,
          })),
        ];
      }

      if (newTags && newTags.length) {
        const newTagPromises = newTags.map(tag => Tag.create(viewer, tag, trx));

        const newTagsInDB = await Promise.all(newTagPromises);
        tagsByProposal = [
          ...tagsByProposal,
          ...newTagsInDB.map(tag => ({
            proposal_id: proposal.id,
            tag_id: tag.id,
          })),
        ];
      }

      if (tagsByProposal.length) {
        await knex('proposal_tags')
          .transacting(trx)
          .insert(tagsByProposal);
      }

      // update counts
      await Promise.all(
        existingTags.map(t =>
          knex('tags')
            .transacting(trx)
            .forUpdate()
            .where({ id: t.id })
            .increment('count', 1),
        ),
      );
    }
  }

  static async matchTags(tags) {
    let existingTags;
    let newTags;
    if (!tags || !tags.length) {
      return { error: 'No tags provided', errorCode: ErrorCodes.NO_ARGS };
    }
    if (tags.length > NUM_MAX_TAGS)
      return {
        error: `Too many tags: Only ${NUM_MAX_TAGS} allowed`,
        errorCode: ErrorCodes.WRONG_ARGS,
      };

    existingTags = tags.filter(tag => 'id' in tag);
    newTags = tags.filter(tag => 'text' in tag && !('id' in tag));

    // check if new tags don't already exist
    const queries = newTags.map(tag =>
      knex('tags')
        .where('text', 'ilike', tag.text)
        .select(),
    );

    let duplicates = await Promise.all(queries);
    duplicates = duplicates.reduce((acc, curr) => acc.concat(curr), []);
    duplicates.forEach(dup => {
      if (dup.id) {
        existingTags.push(dup);
        newTags = newTags.filter(
          t => t.text.toLowerCase() !== dup.text.toLowerCase(),
        );
      }
    });

    // deduplicate
    existingTags = dedup(existingTags);
    newTags = dedup(newTags);
    return { existingTags, newTags };
  }
}

export default Tag;
