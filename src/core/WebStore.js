// import { throwIfMissing } from './utils';
import cloudinary from '../data/cloudinary';

const streamUpload = (buffer, options) =>
  new Promise(resolve => {
    cloudinary.uploader
      .upload_stream(data => resolve(data), options)
      .end(buffer);
  });

class WebStore {
  // eslint-disable-next-line class-methods-use-this
  async saveFile(file, options) {
    if (Buffer.isBuffer(file)) {
      return streamUpload(file, options);
    }
    throw new Error('Input must be a buffer');
  }
  // eslint-disable-next-line class-methods-use-this
  async deleteFile(file) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        file,
        (err, data) => (err ? reject(err) : resolve(data)),
      );
    });
  }
}

export default WebStore;
