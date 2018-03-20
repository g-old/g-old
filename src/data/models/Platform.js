import knex from '../knex';
import User from './User';
import Group from './Group';
import { canSee, canMutate, Models } from '../../core/accessControl';

class Platform {
  constructor(data) {
    this.names = data.settings.names;
    this.picture = data.settings.picture;
    this.defaultGroupId = data.settings.default_group_id;
    this.adminId = data.settings.admin_id;
    this.updatedAt = data.updatedAt;
  }
  static async gen(viewer, { platforms }) {
    const data = await platforms.load('platform');
    if (data === null) return null;
    return canSee(viewer, data, Models.PLATFORM) ? new Platform(data) : null;
  }
  static async create(viewer, data, loaders) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.PLATFORM)) return null;
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
        throw new Error('platform-admin-notfound');
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
        throw new Error('platform-group-notfound');
      }
    }

    const platformInDB = await knex.transaction(async trx => {
      const [platform = null] = await knex('platform_settings')
        .transacting(trx)
        .insert(newData)
        .returning('*');
      return platform;
    });
    return platformInDB ? new Platform(platformInDB) : null;
  }

  static async update(viewer, data, loaders) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.PLATFORM)) return null;
    const [platformData = null] = await knex('platform_settings').select();
    const newData = {
      settings: platformData.settings,
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
      const platform = await Platform.gen(viewer, loaders);
      if (data.adminId !== platform.adminId) {
        // check user, give him rights
        const newAdmin = await User.gen(viewer, data.adminId, loaders);
        if (newAdmin) {
          newData.settings.admin_id = data.adminId;
        } else {
          throw new Error('platform-admin-notfound');
        }
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
        throw new Error('platform-group-notfound');
      }
    }
    const updatedPlatform = await knex.transaction(async trx => {
      const [platform = null] = await knex('platform_settings')
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      if (platform) {
        // update successful
        let updatedUserResult;
        if (data.adminId) {
          updatedUserResult = await User.update(
            viewer,
            {
              id: data.adminId,
              rights: { platform: ['admin'] },
            },
            loaders,
          );
          if (!updatedUserResult.user) {
            throw new Error('update-user-error');
          } else if (
            platformData.settings.admin_id &&
            platformData.settings.adminId !== data.adminId
          ) {
            // remove admin rights
            updatedUserResult = await User.update(
              viewer,
              {
                id: platformData.settings.admin_id,
                rights: { platform: [] },
              },
              loaders,
            );
          }
          if (!updatedUserResult.user) {
            throw new Error('update-user-error');
          }
        }
      }
      return platform;
    });
    return updatedPlatform ? new Platform(updatedPlatform) : null;
  }
  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.PLATFORM)) return null;
    throw new Error('To implement');
  }
}
export default Platform;
