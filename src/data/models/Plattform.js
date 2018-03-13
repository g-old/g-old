import knex from '../knex';
import User from './User';
import Group from './Group';
import { canSee, canMutate, Models } from '../../core/accessControl';

class Plattform {
  constructor(data) {
    this.names = data.settings.names;
    this.picture = data.settings.picture;
    this.defaultGroupId = data.settings.default_group_id;
    this.adminId = data.settings.admin_id;
    this.updatedAt = data.updatedAt;
  }
  static async gen(viewer, { plattforms }) {
    const data = await plattforms.load('plattform');
    if (data === null) return null;
    return canSee(viewer, data, Models.PLATTFORM) ? new Plattform(data) : null;
  }
  static async create(viewer, data, loaders) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.PLATTFORM)) return null;
    const newData = { created_at: new Date() };
    if (data.name) {
      newData.name = data.name;
    }

    if (data.adminId) {
      // check user, give him rights
      const newAdmin = await User.gen(viewer, data.adminId, loaders);
      if (newAdmin) {
        newData.admin_id = data.adminId;
      } else {
        throw new Error('plattform-admin-notfound');
      }
    }
    if (data.defaultGroupId) {
      const defaultGroup = await Group.gen(
        viewer,
        data.defaultGroupId,
        loaders,
      );
      if (defaultGroup) {
        newData.default_group_id = data.defaultGroupId;
      } else {
        throw new Error('plattform-group-notfound');
      }
    }

    const plattformInDB = await knex.transaction(async trx => {
      const [plattform = null] = await knex('plattform_settings')
        .transacting(trx)
        .insert(newData)
        .returning('*');
      return plattform;
    });
    return plattformInDB ? new Plattform(plattformInDB) : null;
  }

  static async update(viewer, data, loaders) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.PLATTFORM)) return null;
    const [plattformData = null] = await knex('plattform_settings').select();
    const newData = {
      settings: plattformData.settings,
      updated_at: new Date(),
    };
    if (data.names) {
      const newNames = JSON.parse(data.names);
      // merge names

      newData.settings.names = {
        ...newData.settings.names,
        ...newNames,
      };
    }

    if (data.adminId) {
      // check user, give him rights
      const newAdmin = await User.gen(viewer, data.adminId, loaders);
      if (newAdmin) {
        newData.settings.admin_id = data.adminId;
      } else {
        throw new Error('plattform-admin-notfound');
      }
    }
    if (data.defaultGroupId) {
      const defaultGroup = await Group.gen(
        viewer,
        data.defaultGroupId,
        loaders,
      );
      if (defaultGroup) {
        newData.settings.default_group_id = data.defaultGroupId;
      } else {
        throw new Error('plattform-group-notfound');
      }
    }
    const updatedPlattform = await knex.transaction(async trx => {
      const [plattform = null] = await knex('plattform_settings')
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      if (plattform) {
        // update successful
        let updatedUserResult;
        if (data.adminId) {
          updatedUserResult = await User.update(
            viewer,
            {
              id: data.adminId,
              rights: { plattform: ['admin'] },
            },
            loaders,
          );
          if (!updatedUserResult.user) {
            throw new Error('update-user-error');
          } else if (
            plattformData.settings.admin_id &&
            plattformData.settings.adminId !== data.adminId
          ) {
            // remove admin rights
            updatedUserResult = await User.update(
              viewer,
              {
                id: plattformData.settings.admin_id,
                rights: { plattform: [] },
              },
              loaders,
            );
          }
          if (!updatedUserResult.user) {
            throw new Error('update-user-error');
          }
        }
      }
      return plattform;
    });
    return updatedPlattform ? new Plattform(updatedPlattform) : null;
  }
  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.PLATTFORM)) return null;
    throw new Error('To implement');
  }
}
export default Plattform;
