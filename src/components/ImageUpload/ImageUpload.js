import React from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ImageUpload.css';

const standardValues = {
  scale: 1,
  borderRadius: 0,
  preview: null,
  rotate: 0,
  loaded: false,
};
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

  render() {
    let uploader = null;
    let editor = null;
    const { uploadPending, uploadError } = this.props;

    if (this.state.src) {
      editor = (
        <div>
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
          <br />
          <div>
            {this.state.loaded && 'Drag, rotate or zoom, then upload!'}
          </div>
          <div>

            {'Zoom:'}
            <br />
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
            <br />
            <span>
              {'Rotate :'}
              <button
                style={{ marginLeft: '1em', marginTop: '2em' }}
                onClick={this.handleRightRotation}
              >
                RIGHT
              </button>
            </span>
          </div>
          <div style={{ marginTop: '2em' }}>
            <button className={s.button} onClick={this.handleSave} disabled={uploadPending}>
              UPLOAD
            </button>
          </div>
          {uploadPending && 'Uploading...'}
          {uploadError && uploadError}
        </div>
      );
    }
    uploader = (
      <div style={{ width: '100%' }}>
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
      </div>
    );

    return (
      <div className={s.root}>
        <div className={s.container}>
          {uploader}
          {this.props.uploadSuccess && 'Uploaded'}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ImageUpload);
