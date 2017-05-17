import cloudinary from 'cloudinary';
import config from '../../private_configs';

cloudinary.config(config.cloudinary);

export default cloudinary;
