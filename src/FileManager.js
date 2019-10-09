import ImageManager from './core/ImageManager';

const IManager = new ImageManager({
  folder: 'images',
  privateFolder: 'private_files',
  imageSizes: [460, 720],
});
IManager.init();
export default IManager;
