// @flow
import knex from '../knex';
import { canMutate, Models, PermissionError } from '../../core/accessControl';
import type { Localization } from './PollingMode';
import config from '../../config';

type ID = string | number;
type TagInput = {
  id?: ID,
  text?: Localization,
  count?: number,
};

type ResultType = {
  errors?: $ReadOnlyArray<string>,
  data?: Localization,
};
const { locales } = config;
const validateLocalizations = (localizations: string): ResultType => {
  const errors = [];
  if (localizations.length > 1000) {
    errors.push('localization to large');
    return { errors };
  }
  const parsed: Localization = JSON.parse(localizations);
  const validated = Object.keys(parsed).reduce((acc, curr) => {
    const locale = [...locales, 'default_name'].find(l => l === curr);

    if (!(locale in acc)) {
      acc[locale] = curr[locale];
    }
    return acc;
  }, {});

  if (!validated.default_name) {
    errors.push('value-default_name-missing');
    return { errors };
  }
  return { data: validated };
};

const validateTagText = text => {
  // validate localizations
  const { errors, data } = validateLocalizations(text);
  if (errors) {
    return errors;
  }
  return data;
  // TODO validate tags length etc
};

class Tag {
  id = ID;
  text: Localization;
  count: number;
  constructor(data) {
    this.id = data.id;
    this.text = data.text;
    this.count = data.count;
  }

  static async gen(viewer, id, { tags }) {
    const data = await tags.load(id);
    return data ? new Tag(data) : null;
  }

  static async create(viewer, data: TagInput, trx?: {}) {
    if (!data || !data.text) return null;
    if (!canMutate(viewer, data, Models.TAG)) {
      throw new PermissionError({ viewer, data, model: Models.TAG });
    }

    const newData = {
      text: validateTagText(data.text),
    };

    const [tag] = await knex('tags')
      .transacting(trx)
      .insert(newData)
      .returning('*');

    return new Tag(tag);
  }

  /* static async createMany(viewer, data: [TagInput], trx?: {}) {
    const newData = {};
    // TODO
  } */

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
