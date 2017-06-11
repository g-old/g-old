import React from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ImageUpload.css';
import Box from '../Box';
import Button from '../Button';
import Label from '../Label';

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
});

class ImageUpload extends React.Component {
  static propTypes = {
    uploadAvatar: PropTypes.func.isRequired,
    uploadPending: PropTypes.bool.isRequired,
    uploadError: PropTypes.shape({}),
    uploadSuccess: PropTypes.bool,
  };
  static defaultProps = {
    uploadError: null,
    uploadSuccess: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      ...standardValues,
      src: null,
      showEditor: false,
    };

    this.setEditorRef = this.setEditorRef.bind(this); // es2016 bind syntax!
    this.handleSave = this.handleSave.bind(this);
    this.onChange = this.onChange.bind(this);
    this.handleScale = this.handleScale.bind(this);
    this.handleRightRotation = this.handleRightRotation.bind(this);
    this.handleLeftRotation = this.handleLeftRotation.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.uploadSuccess) {
      this.setState({ showEditor: false, src: '' });
    }
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
      this.setState({ src: reader.result, showEditor: true, ...standardValues });
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
    let uploader = null;
    let editor = null;
    const { uploadPending, uploadError } = this.props;

    if (this.state.src) {
      editor = (
        <Box justify>
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
          <Box pad column>
            <Label>{'Zoom:'}</Label>
            <input
              className={s.slider}
              name="scale"
              type="range"
              onChange={this.handleScale}
              min="1"
              max="2"
              step="0.01"
              defaultValue="1"
            />
            <Button
              label={<FormattedMessage {...messages.rotate} />}
              icon={
                <svg viewBox={'0 0 24 24'} width={24} height={24}>
                  <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    d="M8,3 L3,8 L8,13 M12,20 L15,20 C18.3137085,20 21,17.3137085 21,14 C21,10.6862915 18.3137085,8 15,8 L4,8"
                  />
                </svg>
              }
              onClick={this.handleLeftRotation}
            />
            <Button
              fill
              primary
              label={<FormattedMessage {...messages.upload} />}
              onClick={this.handleSave}
              disabled={uploadPending}
            />
          </Box>
          {uploadPending && 'Uploading...'}
          {uploadError && uploadError}
        </Box>
      );
    }
    uploader = (
      <Box column>
        <input
          className={s.inputfile}
          name="file"
          type="file"
          id="file"
          accept="image/*"
          onChange={this.onChange}
        />
        <label htmlFor="file">Click to choose your image</label>
        <br style={{ clear: 'both' }} />
        {this.state.showEditor && editor}
      </Box>
    );

    return (
      <Box>
        {uploader}
        {this.props.uploadSuccess && 'Uploaded'}
      </Box>
    );
  }
}

export default withStyles(s)(ImageUpload);
