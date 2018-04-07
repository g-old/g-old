import React from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';
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

class ImageUpload extends React.Component {
  static propTypes = {
    uploadImage: PropTypes.func.isRequired,
    uploadPending: PropTypes.bool.isRequired,
    uploadError: PropTypes.shape({}),
    onClose: PropTypes.func,
    ratio: PropTypes.number,
    serverResizing: PropTypes.bool,
    inLayer: PropTypes.bool,
  };
  static defaultProps = {
    uploadError: null,
    onClose: null,
    ratio: null,
    serverResizing: null,
    inLayer: null,
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
      ({ files } = e.dataTransfer);
    } else if (e.target) {
      ({ files } = e.target);
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({ src: reader.result, file: files[0], ...standardValues });
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
      const croppingRect = this.editor.getCroppingRect();
      const image = this.state.file;
      this.props.uploadImage(image, croppingRect);
    } else {
      const img = this.editor
        .getImageScaledToCanvas()
        .toDataURL('image/jpeg', 0.5); // this.editor.getImage().toDataURL();

      this.props.uploadImage({ dataUrl: img });
    }
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
    const {
      uploadPending,
      uploadError,
      onClose,
      ratio = 1,
      serverResizing,
      inLayer,
    } = this.props;
    const disableControls = !this.state.src;

    editor = (
      <Box pad justify column align>
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
          rotate={this.state.rotate || 0}
          onLoadFailure={() =>
            alert('Image could not been loaded -> load another one')
          }
        />
        <Box pad column justify>
          <Box pad justify align>
            <Label>Zoom:</Label>

            <Button
              plain
              disable={disableControls}
              onClick={() => {
                this.setState({ scale: this.state.scale + 0.1 });
              }}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  width="24px"
                  height="24px"
                  role="img"
                  aria-label="add"
                >
                  <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    d="M12,22 L12,2 M2,12 L22,12"
                  />
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
                  <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    d="M2,12 L22,12"
                  />
                </svg>
              }
            />
          </Box>
          {!serverResizing && (
            <Box justify>
              <Button
                disable={disableControls}
                plain
                label="Drehen"
                onClick={this.handleLeftRotation}
              >
                <svg viewBox="0 0 24 24" width={24} height={24}>
                  <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    d={ICONS.retry}
                  />
                </svg>
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    );
    const uploader = (
      <div className={s.article}>
        <FormField label="Datei">
          <input
            ref={
              input => (this.input = input) // eslint-disable-line
            }
            onChange={this.onChange}
            accept="image/*"
            type="file"
          />
        </FormField>
        <FormField label="Foto">{editor}</FormField>
        <div className={s.footer}>
          <Button
            primary
            label="Hochladen"
            onClick={this.handleSave}
            disabled={uploadPending || disableControls}
          />
        </div>
        {uploadPending && 'Uploading...'}
        {uploadError && (
          <div style={{ backgroundColor: 'rgba(255, 50, 77, 0.3)' }}>
            {uploadError.error}
          </div>
        )}
      </div>
    );
    return inLayer ? <Layer onClose={onClose}>uploader</Layer> : { uploader };
  }
}

export default withStyles(s)(ImageUpload);
