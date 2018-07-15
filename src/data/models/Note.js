import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import sanitize from '../../core/htmlSanitizer';

const sanititzeTextnput = textHtml => {
  const input = Object.keys(textHtml).reduce((acc, locale) => {
    const text = textHtml[locale];
    if (text.length < 10000 && text.length > 0) {
      acc[locale] = sanitize(text);
    }
    return acc;
  }, {});

  if (Object.keys(input).length < 1) {
    return null;
  }
  return input;
};
class Note {
  constructor(data) {
    this.id = data.id;
    this.category = data.category;
    this.textHtml = data.text_html;
    this.keyword = data.keyword;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.isPublished = data.is_published;
  }

  static async gen(viewer, id, { notes }) {
    const data = await notes.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.NOTE) ? new Note(data) : null;
  }

  static async create(viewer, data, loaders, trx) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.NOTE)) return null;

    const newData = {
      created_at: new Date(),
    };
    if (data.textHtml) {
      const text = sanititzeTextnput(data.textHtml);
      if (text) {
        newData.text_html = text;
      } else {
        return null;
      }
    }

    if (data.category) {
      newData.category = data.category;
    }
    if (data.keyword) {
      newData.keyword = data.keyword;
    }
    if ('isPublished' in data) {
      newData.is_published = data.isPublished;
    }

    const [note = null] = await knex('notes')
      .modify(queryBuilder => {
        if (trx) {
          queryBuilder.transacting(trx);
        }
      })
      .insert(newData)
      .returning('*');

    return note ? new Note(note) : null;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.NOTE)) return null;
    const newData = { updated_at: new Date() };
    if (data.textHtml) {
      const text = sanititzeTextnput(data.textHtml);
      if (text) {
        newData.text_html = text;
      } else {
        return null;
      }
    }
    const updatedNote = await knex.transaction(async trx => {
      const [note = null] = await knex('notes')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      return note;
    });

    return updatedNote ? new Note(updatedNote) : null;
  }

  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.NOTE)) return null;
    const deletedNote = await knex.transaction(async trx => {
      await knex('notes')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();
    });

    return deletedNote ? new Note(deletedNote) : null;
  }
}

export default Note;
