import knex from '../knex';
import { canMutate, Models } from '../../core/accessControl';

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

  static async create(viewer, data) {
    if (!data || !data.text) return null;
    if (!canMutate(viewer, data, Models.TAG)) return null;

    const newData = {
      text: data.text,
      ...(data.deName && { de_name: data.deName }),
      ...(data.itName && { it_name: data.itName }),
      ...(data.lldName && { lld_name: data.lldName }),
    };
    const tagInDB = await knex.transaction(async trx => {
      const [tag = null] = await knex('tags')
        .transacting(trx)
        .insert(newData)
        .returning('*');

      return tag;
    });

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
}

export default Tag;
