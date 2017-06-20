import React from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ImageUpload.css';
import Box from '../Box';
import Button from '../Button';
import Label from '../Label';
import Layer from '../Layer';
import FormField from '../FormField';
import { ICONS } from '../../constants';

const standardValues = {
  scale: 1,
  borderRadius: 0,
  preview: null,
  rotate: 0,
  loaded: false,
};

const messages = defineMessages({
  upload: {
    id: 'commands.upload',
    defaultMessage: 'Upload',
    description: 'Short command for uploading',
  },
  rotate: {
    id: 'commands.rotate',
    defaultMessage: 'Rotate',
    description: 'Short command for rotation',
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
  };
  static defaultProps = {
    uploadError: null,
    uploadSuccess: false,
    onClose: null,
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
    this.handleScale = this.handleScale.bind(this);
    this.handleRightRotation = this.handleRightRotation.bind(this);
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
    const img = this.editor.getImageScaledToCanvas().toDataURL('image/jpeg', 0.5); // this.editor.getImage().toDataURL();
    const rect = this.editor.getCroppingRect();
    this.setState({
      preview: img,
      croppingRect: rect,
    });
    this.props.uploadAvatar({ dataUrl: img });
  }

  handleScale(e) {
    const scale = parseFloat(e.target.value);
    this.setState({ scale });
  }

  handleRightRotation() {
    const rotate = (this.state.rotate + 90) % 360;
    this.setState({ rotate });
  }
  handleLeftRotation() {
    const rotate = (this.state.rotate - 90) % 360;
    this.setState({ rotate });
  }

  render() {
    let editor = null;
    const { uploadPending, uploadError, onClose } = this.props;
    const disableControls = !this.state.src;

    editor = (
      <Box pad justify column>
        <AvatarEditor
          ref={this.setEditorRef}
          image={this.state.src}
          onSave={this.handleSave}
          borderRadius={10}
          width={256}
          height={256}
          border={50}
          color={[255, 255, 255, 0.6]} // RGBA
          scale={this.state.scale}
          rotate={this.state.rotate || 0}
          onLoadFailure={() => alert('Image could not been loaded -> load another one')}
          onLoadSuccess={() => this.setState({ loaded: true })}
        />
        <Box pad column justify>

          <Box pad justify>
            <Label>{'Zoom:'}</Label>

            <Button
              plain
              disable={disableControls}
              onClick={() => {
                this.setState({ scale: this.state.scale + 0.1 });
              }}
              icon={
                <svg viewBox="0 0 24 24" width="24px" height="24px" role="img" aria-label="add">
                  <path fill="none" stroke="#000" strokeWidth="2" d="M12,22 L12,2 M2,12 L22,12" />
                </svg>
              }
            />

            <Button
              plain
              disable={disableControls}
              onClick={() => {
                this.setState({ scale: Math.max(this.state.scale - 0.1, 1) });
              }}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  width="24px"
                  height="24px"
                  role="img"
                  aria-label="subtract"
                >
                  <path fill="none" stroke="#000" strokeWidth="2" d="M2,12 L22,12" />
                </svg>
              }
            />
          </Box>
          <Box justify>
            <Button
              disable={disableControls}
              plain
              label={<FormattedMessage {...messages.rotate} />}
              onClick={this.handleLeftRotation}
            >
              <svg viewBox={'0 0 24 24'} width={24} height={24}>
                <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.retry} />
              </svg>
            </Button>
          </Box>
        </Box>

      </Box>
    );

    return (
      <Layer onClose={onClose}>
        <div className={s.article}>
          <FormField label="File">
            <input
              ref={input => (this.input = input)}
              onChange={this.onChange}
              accept="image/*"
              type="file"
            />
          </FormField>
          <FormField label="Image">
            {editor}

          </FormField>
          <div className={s.footer}>
            <Button
              primary
              label={<FormattedMessage {...messages.upload} />}
              onClick={this.handleSave}
              disabled={uploadPending || disableControls}
            />
          </div>
          {uploadPending && 'Uploading...'}
          {uploadError &&
            <div style={{ backgroundColor: 'rgba(255, 50, 77, 0.3)' }}>
              <FormattedMessage {...messages.error} />
            </div>}
        </div>
      </Layer>
    );
  }
}

export default withStyles(s)(ImageUpload);
