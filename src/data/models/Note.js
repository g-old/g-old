import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';

class Note {
  constructor(data) {
    this.id = data.id;
  }

  static async gen(viewer, id, { notes }) {
    const data = await notes.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.NOTE) ? new Note(data) : null;
  }

  static async create(viewer, data) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.NOTE)) return null;

    const newData = {
      created_at: new Date(),
    };
    const noteInDB = await knex.transaction(async trx => {
      const [note = null] = await knex('notes')
        .transacting(trx)
        .insert(newData)
        .returning('*');

      return note;
    });

    return noteInDB ? new Note(noteInDB) : null;
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
