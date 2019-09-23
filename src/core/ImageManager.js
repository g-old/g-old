import uuid from 'uuid/v4';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import Errors from './errorcodes';
import log from '../logger';

// import Image from '../data/models/Image';
// import db from '../db';

function fileExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, err => (err ? reject(err) : resolve(filePath)));
  });
}
function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-confusing-arrow
    fs.unlink(filePath, err => (err ? reject(err) : resolve()));
  });
}

function makeDir(fPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(fPath);
    fs.mkdir(dir, { recursive: true }, err => {
      if (err && err.code !== 'EEXIST') {
        reject(err);
      } else {
        resolve(fPath);
      }
    });
  });
}
const extractFileFromBase64 = dataUrl => {
  const result = {};
  const [info, data] = dataUrl.split(',');
  if (!info || !data || info.indexOf('base64') < 0) {
    return result;
  }
  const regex = /^data:.+\/(.+);base64/;
  const matches = info.match(regex);
  result.fileData = data;
  // eslint-disable-next-line prefer-destructuring
  result.extension = matches[1];
  return result;
};
const getFileData = file => {
  if (file.constructor === String) {
    return { ...extractFileFromBase64(file), isBase64: true };
  }
  return { fileData: file.buffer, isBase64: false };
};

const genFileName = extension => `${uuid()}.${extension}`;
const genTFolderName = size => `s${size}x${size}`;
const genFolderName = size => `s${size}`;

const genFullPath = (folders, name) =>
  path.resolve(__dirname, ...folders, name);
/*
const readDirectory = dirName =>
  new Promise((resolve, reject) => {
    fs.readDir(dirName, (err, data) => (err ? reject(err) : resolve(data)));
  });

const isDirectory = file =>
  new Promise((resolve, reject) => {
    fs.stat(
      file,
      (err, data) => (err ? reject(err) : resolve(data.isDirectory())),
    );
  });
*/
class ImageManager {
  constructor(props) {
    let tSizes;
    let iSizes;
    if (props.thumbnailSizes && props.thumbnailSizes.length) {
      tSizes = props.thumbnailSizes.map(size => parseInt(size, 10));
    }
    if (props.imageSizes && props.imageSizes.length) {
      iSizes = props.imageSizes.map(size => parseInt(size, 10));
    }
    tSizes = tSizes || [150, 240, 320, 480];
    iSizes = iSizes || [640, 750, 1080];

    this.thumbnailSizes = tSizes;
    this.imageSizes = iSizes;
    this.originals = 'originals';

    if (!props.folder) {
      throw new Error(
        'A base directory must be specified. Folder argument is missing!',
      );
    }

    this.baseFolder = props.folder;
    this.maxFileSize = props.maxFileSize || 10 * 1000 * 1000;
    this.maxFileNumber = props.maxFileNumber || 10;

    this.store = this.store.bind(this);
    this.saveImageToHDD = this.saveImageToHDD.bind(this);
  }

  init() {
    const basePath = path.resolve(__dirname, this.baseFolder);
    // return makeDir(basePath);
    try {
      return fs.mkdirSync(basePath);
    } catch (e) {
      if (e && e.code !== 'EEXIST') {
        throw new Error(e, 'Cannot make image dir');
      }
      return true;
    }
  }

  async saveImageToHDD(buffer, fileName) {
    const image = sharp(buffer);
    const folder = this.baseFolder;
    await image.metadata().then(async () => {
      const pathForOriginal = genFullPath([folder, this.originals], fileName);
      await makeDir(pathForOriginal);
      await image.jpeg().toFile(pathForOriginal);

      const thumbnailPromises = this.thumbnailSizes.map(async size => {
        const fullPath = genFullPath([folder, genTFolderName(size)], fileName);
        await makeDir(fullPath);
        return image
          .resize(size, size)
          .jpeg()
          .toFile(fullPath);
      });

      const imagePromises = this.imageSizes.map(async size => {
        const fullPath = genFullPath([folder, genFolderName(size)], fileName);
        await makeDir(fullPath);
        image
          .resize(size)
          .jpeg()
          .toFile(fullPath);
      });

      await Promise.all([...thumbnailPromises, ...imagePromises]);
    });
    return true;
  }

  async cropImage(viewer, { file, crop, size, fileName, rotation }) {
    const { fileData, isBase64 } = getFileData(file);
    const imgBuffer = Buffer.from(fileData, isBase64 ? 'base64' : undefined);
    try {
      const image = sharp(imgBuffer);

      const fullPath = genFullPath(
        [this.baseFolder, genFolderName(size)],
        fileName,
      );
      await makeDir(fullPath);

      const metadata = await image.metadata();
      // perform your calculations based on metadata.width and metadata.height
      const left = parseInt(metadata.width * crop.x, 10);
      const top = parseInt(metadata.height * crop.y, 10);
      const width = parseInt(metadata.width * crop.width, 10);
      const height = parseInt(metadata.height * crop.height, 10);

      await image
        .rotate(rotation)
        .extract({ left, top, width, height })
        .resize(size)
        .toFile(fullPath);
      return fileName;
    } catch (err) {
      log.error({ err, viewer }, 'Cropping failed');

      return false;
    }
  }

  async store(viewer, { file, index }) {
    let result;
    if (file.length > this.maxFileSize) {
      throw new Error(
        `File size at index ${index} is greater than MAX_FILE_SIZE:${this.maxFileSize} File: ${file.length}`,
      );
    }
    const { fileData, isBase64 } = getFileData(file);
    if (!fileData) {
      // TODO allow blob too
      throw new Error('File is not base64 encoded!');
    }
    const imgBuffer = Buffer.from(fileData, isBase64 ? 'base64' : undefined);
    const fileName = genFileName('jpg');

    try {
      const success = await this.saveImageToHDD(imgBuffer, fileName);
      if (success) {
        /* const imageResult = await Image.create(
          viewer,
          { path: fileName, section },
          loaders,
        ); */
        result = true; // imageResult.result;
      }
    } catch (e) {
      console.error('WRITING FAILED', e);
    }
    return result;
  }

  async storeImages({ viewer, data: { images, params }, loaders }) {
    const errors = [];
    if (!viewer || !images || !params || !loaders) {
      errors.push(Errors.ARGUMENT_MISSING);
      return { error: errors };
    }

    let files;
    if (!Array.isArray(images)) {
      files = [images];
    } else {
      if (images.length > this.maxFileNumber) {
        errors.push(Errors.ARGUMENT_ERROR);
        return { error: errors };
      }
      files = images;
    }

    try {
      // pass cb?
      if (params.cropCoordinates) {
        const promises = files.map(async (file, index) => {
          const fileName = genFileName('jpg');

          const cropPromises = this.imageSizes.map(size => {
            return this.cropImage(
              viewer,
              {
                file,
                index,
                crop: params.cropCoordinates,
                size,
                fileName,
                rotation: params.rotation,
              },
              loaders,
            );
          });
          return Promise.all(cropPromises);
        });
        const result = await Promise.all(promises);
        // must return full path
        return { errors, result };
      }

      const promises = files.map((file, index) =>
        this.store(viewer, { file, index, section: params.section }, loaders),
      );

      const result = await Promise.all(promises);

      return { errors, result };
    } catch (e) {
      // final catch
      return { errors };
    }
  }

  async deleteImage({ viewer, data: { fileName } }) {
    const errors = [];
    if (!viewer || !fileName) {
      errors.push(Errors.ARGUMENT_MISSING);
      return { error: errors };
    }
    const subDirs = [
      ...this.thumbnailSizes.map(genTFolderName),
      ...this.imageSizes.map(genFolderName),
      this.originals,
    ];
    const promises = subDirs.map(dir => {
      const fPath = genFullPath([this.baseFolder, dir], fileName);
      return fileExists(fPath).then(deleteFile, () => {
        console.error(`File not found: ${fPath}`);
      });
    });

    return Promise.all(promises)
      .then(() => ({ errors, result: true }))
      .catch(e => ({ errors: [...errors, e] }));
  }
}

export default ImageManager;
