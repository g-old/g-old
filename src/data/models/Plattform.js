import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';

class Plattform {
  constructor(data) {
    this.name = data.name;
    this.picture = data.picture;
    this.defaultGroupId = data.default_group_id;
    this.adminId = data.admin_id;
  }
  static async gen(viewer, id, { plattforms }) {
    const data = await plattforms.load();
    if (data === null) return null;
    return canSee(viewer, data, Models.PLATTFORM) ? new Plattform(data) : null;
  }
  static async create(viewer, data) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.PLATTFORM)) return null;
    const newData = { created_at: new Date() };
    const plattformInDB = await knex.transaction(async trx => {
      const [plattform = null] = await knex('plattforms')
        .transacting(trx)
        .insert(newData)
        .returning('*');
      return plattform;
    });
    return plattformInDB ? new Plattform(plattformInDB) : null;
  }
  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.PLATTFORM)) return null;
    const newData = { updated_at: new Date() };
    const updatedPlattform = await knex.transaction(async trx => {
      const [plattform = null] = await knex('plattforms')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');
      return plattform;
    });
    return updatedPlattform ? new Plattform(updatedPlattform) : null;
  }
  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.PLATTFORM)) return null;
    const deletedPlattform = await knex.transaction(async trx => {
      await knex('plattforms')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();
    });
    return deletedPlattform ? new Plattform(deletedPlattform) : null;
  }
}
export default Plattform;
