/* eslint-env jest */

import { createTestActor, createTestUser, clearDB } from '../../../test/utils';
import knex from '../../data/knex';
import createLoaders from '../../data/dataLoader';
import FileStorage, { AvatarManager } from '../FileStorage';

jest.setTimeout(10000);

const tUrlToUrl = tUrl => {
  let res;
  if (tUrl.indexOf(',')) {
    // has thumbnailUrl
    const stIndex = tUrl.indexOf('c_scale');
    if (stIndex > 0) {
      const endIndex = stIndex + 18; // (!)
      res = tUrl.slice(0, stIndex) + tUrl.substring(endIndex);
    }
  }
  return res;
};

describe('FileStorage', () => {
  it('Should generate a thumbnail', async () => {
    await clearDB();
    const FileStore = FileStorage(AvatarManager({ local: false }));
    const mockPublicIds = ['iamapublicid'];
    const mockCloud = () => {
      let idCounter = 0;
      const store = {};
      return {
        save: (data, options) => {
          let url = 'https://cloud.com/upload/';
          let pId;
          let tUrl;
          if (options) {
            if (options.public_id) {
              url += `${options.public_id}.png`;
              pId = options.public_id;
            }
            if (options.eager) {
              const { crop, width, height } = options.eager[0];
              const cutIndex = url.indexOf('upload/') + 7;
              if (!pId) {
                pId = mockPublicIds[idCounter];
                url += `${pId}.png`;
                idCounter += 1;
              }
              tUrl = `${url.slice(
                0,
                cutIndex,
              )}c_${crop},h_${height},w_${width}/${url.substring(cutIndex)}`;
              store[tUrl] = { transformation: options.eager, url: tUrl };
            }
          } else {
            url += `${mockPublicIds[0]}.png`;
          }
          if (!pId) {
            pId = mockPublicIds[idCounter];
            idCounter += 1;
          }
          store[url] = { data, url, ...(options.eager && { tUrl }) };
          return {
            url,
            public_id: pId,
            ...(options.eager && { eager: [{ url: tUrl }] }),
          };
        },
        getStore: () => store,
      };
    };
    const cloud = mockCloud();
    const mockUpload = (buffer, options) =>
      Promise.resolve(cloud.save(buffer, options));
    const mockDelete = id => Promise.resolve(id);
    /* eslint-disable no-underscore-dangle */
    FileStorage.__set__('uploadToCloudinaryStream', mockUpload);
    FileStorage.__set__('deleteFileOnCloudinary', mockDelete);
    /* eslint-enable no-underscore-dangle */

    const testActor = createTestActor({ id: 1 });
    const testUser = createTestUser({ id: 1 });
    await knex('users').insert(testUser);

    const testDataUrl = 'data:image/png;base64,iamadataurl';

    const updatedUserData = await FileStore.save({
      viewer: testActor,
      data: { dataUrl: testDataUrl, id: 1 },
      loaders: createLoaders(),
    });

    expect(updatedUserData).not.toBeFalsy();
    expect(updatedUserData.thumbnail).toMatch(
      cloud.getStore()[updatedUserData.thumbnail].url,
    );

    const avatarUrl = tUrlToUrl(updatedUserData.thumbnail);
    expect(cloud.getStore()[avatarUrl].url).toBeDefined();
    expect(updatedUserData.avatar).toMatch(avatarUrl);
  });
});
