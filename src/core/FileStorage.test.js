/* eslint-env jest */

import { createTestActor } from '../../test/utils';
import FileStorage from './FileStorage';
import createLoaders from '../data/dataLoader';
import { Permissions } from '../organization';

describe('FileStorage', () => {
  it('Should return false if file deletion fails', async () => {
    /* eslint-disable no-underscore-dangle */
    FileStorage.__set__('deleteFileOnCloudinary', () => {
      throw new Error('Test');
    });
    FileStorage.__set__('User', {
      gen: () => Promise.resolve({ thumbnail: 'athumbnail' }),
    });

    const deleteFromCloudinary = FileStorage.__get__('deleteFromCloudinary');
    /* eslint-enable no-underscore-dangle */

    const testViewer = createTestActor({
      permissions: Permissions.DELETE_ACCOUNTS,
    });
    const testData = { id: '2' };
    const deletionResult = await deleteFromCloudinary({
      viewer: testViewer,
      data: testData,
      loaders: createLoaders(),
    });
    expect(deletionResult).toBe(false);
  });
});
