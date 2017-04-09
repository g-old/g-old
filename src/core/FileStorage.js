import uuid from 'uuid/v4';
import path from 'path';
import fs from 'fs';
import User from '../data/models/User';
import knex from '../data/knex';

function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-confusing-arrow
    fs.unlink(filePath, err => err ? reject(err) : resolve());
  });
}

function writeFile(filePath, content) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-confusing-arrow
    fs.writeFile(filePath, content, err => err ? reject(err) : resolve());
  });
}

// TODO Integrate with Usermodel!
export const AvatarManager = {
  save: async ({ viewer, data, loaders }, folder) => {
    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const matches = data.match(regex);
    const ext = matches[1];
    const img = matches[2];
    const name = `${uuid()}.${ext}`;
    const filepath = path.resolve(__dirname, folder, name);

    const buffer = new Buffer(img, 'base64');
    const avatarPath = path.join('/', name);
    // update
    await knex.transaction(async trx => {
      // utf8 encoding! Problem?
      // TODO delete old avatar if existing
      // TODO resizing serverside
      await writeFile(filepath, buffer);
      try {
        await trx
          .where({
            id: viewer.id,
          })
          .update({ avatar_path: avatarPath, updated_at: new Date() })
          .into('users');
      } catch (error) {
        await deleteFile(filepath);
        throw Error(error);
      }
    });
    return User.gen(viewer, viewer.id, loaders) || null;
  },
};

function FileStorage(manager) {
  return {
    save: manager.save,
  };
}

export default FileStorage;
