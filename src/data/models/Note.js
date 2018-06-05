import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import sanitize from '../../core/htmlSanitizer';

class Note {
  constructor(data) {
    this.id = data.id;
    this.category = data.category;
    this.textHtml = data.text_html;
    this.keyword = data.keyword;
    this.createdAt = data.created_at;
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
      newData.text_html = Object.keys(data.textHtml).reduce((acc, locale) => {
        const text = data.textHtml[locale];

        if (text.length < 10000) {
          acc[locale] = sanitize(text);
        }
        return acc;
      }, {});
    }

    if (data.category) {
      newData.category = data.category;
    }
    if (data.keyword) {
      newData.keyword = data.keyword;
    }

    const [note = null] = await knex('notes')
      .transacting(trx)
      .insert(newData)
      .returning('*');

    return note ? new Note(note) : null;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.NOTE)) return null;
    const newData = { updated_at: new Date() };
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
