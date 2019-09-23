import React from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './ImageUpload.css';
import Box from '../Box';
import Button from '../Button';
import Layer from '../Layer';
import FormField from '../FormField';
import ImageControls from './ImageControls';

const standardValues = {
  scale: 1,
  borderRadius: 0,
  preview: null,
  rotation: 0,
  loaded: false,
};

const messages = defineMessages({
  upload: {
    id: 'commands.upload',
    defaultMessage: 'Upload',
    description: 'Short command for uploading',
  },

  cancel: {
    id: 'commands.cancel',
    defaultMessage: 'Cancel',
    description: 'Short command to cancel a operation',
  },
  error: {
    id: 'action.error',
    defaultMessage: 'Action failed. Please retry!',
    description: 'Short failure notification ',
  },
});

class ImageUpload extends React.Component {
  static propTypes = {
    uploadAvatar: PropTypes.func.isRequired,
    uploadPending: PropTypes.bool.isRequired,
    uploadError: PropTypes.shape({}),
    onClose: PropTypes.func,
    ratio: PropTypes.number,
    serverResizing: PropTypes.bool,
  };

  static defaultProps = {
    uploadError: null,
    uploadSuccess: false,
    onClose: null,
    ratio: null,
    serverResizing: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      ...standardValues,
      src: null,
    };

    this.setEditorRef = this.setEditorRef.bind(this); // es2016 bind syntax!
    this.handleSave = this.handleSave.bind(this);
    this.onChange = this.onChange.bind(this);
    this.handleScaling = this.handleScaling.bind(this);
    this.handleLeftRotation = this.handleLeftRotation.bind(this);
  }

  onChange(e) {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({ src: reader.result, ...standardValues });
    };
    if (files.length) {
      reader.readAsDataURL(files[0]);
    }
  }

  setEditorRef(editor) {
    if (editor) this.editor = editor;
  }

  handleSave() {
    if (this.props.serverResizing) {
      alert('TO IMPLEMENT');
    }
    const img = this.editor
      .getImageScaledToCanvas()
      .toDataURL('image/jpeg', 0.5); // this.editor.getImage().toDataURL();
    const rect = this.editor.getCroppingRect();
    this.setState({
      preview: img,
      croppingRect: rect,
    });
    this.props.uploadAvatar({ dataUrl: img });
  }

  handleScaling(newValue) {
    const scale = parseFloat(newValue);
    this.setState({ scale });
  }

  handleLeftRotation(newRotation) {
    this.setState({ rotation: newRotation });
  }

  render() {
    let editor = null;
    const { uploadPending, uploadError, onClose, ratio = 1 } = this.props;
    const disableControls = !this.state.src;
    const { scale, rotation } = this.state;
    editor = (
      <Box pad justify column>
        <AvatarEditor
          ref={this.setEditorRef}
          image={this.state.src}
          onSave={this.handleSave}
          borderRadius={10}
          width={256 * ratio}
          height={256}
          border={50}
          color={[255, 255, 255, 0.6]} // RGBA
          scale={this.state.scale}
          rotate={this.state.rotation || 0}
          onLoadFailure={() =>
            alert('Image could not been loaded -> load another one')
          }
          onLoadSuccess={() => this.setState({ loaded: true })}
        />
        <Box pad column justify>
          <ImageControls
            scale={scale}
            rotation={rotation}
            disabled={disableControls}
            onScaleChanged={this.handleScaling}
            onRotationChanged={this.handleLeftRotation}
          />
        </Box>
      </Box>
    );

    return (
      <Layer onClose={onClose}>
        <div className={s.article}>
          <FormField label="File">
            <input
              ref={input => (this.input = input)} // eslint-disable-line
              onChange={this.onChange}
              accept="image/*"
              type="file"
            />
          </FormField>
          <FormField label="Image">{editor}</FormField>
          <div className={s.footer}>
            <Button
              primary
              label={<FormattedMessage {...messages.upload} />}
              onClick={this.handleSave}
              disabled={uploadPending || disableControls}
            />
          </div>
          {uploadPending && 'Uploading...'}
          {uploadError && (
            <div style={{ backgroundColor: 'rgba(255, 50, 77, 0.3)' }}>
              <FormattedMessage {...messages.error} />
            </div>
          )}
        </div>
      </Layer>
    );
  }
}

export default withStyles(s)(ImageUpload);
