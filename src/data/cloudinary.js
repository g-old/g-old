import cloudinary from 'cloudinary';
import config from '../config';

cloudinary.config(config.cloudinary);

export default cloudinary;
