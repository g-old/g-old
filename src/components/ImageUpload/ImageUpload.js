import React, { PropTypes } from 'react';
import AvatarEditor from 'react-avatar-editor';

class ImageUpload extends React.Component {
  static propTypes = {
    uploadAvatar: PropTypes.func.isRequired,
    uploadPending: PropTypes.bool.isRequired,
    uploaded: PropTypes.bool.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      src: null,
      scale: 1,
      borderRadius: 0,
      preview: null,
      rotate: 0,
      loaded: false,
    };

    this.setEditorRef = ::this.setEditorRef; // es2016 bind syntax!
    this.handleSave = ::this.handleSave;
    this.onChange = ::this.onChange;
    this.handleScale = ::this.handleScale;
    this.handleRightRotation = ::this.handleRightRotation;
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
      this.setState({ src: reader.result });
    };
    reader.readAsDataURL(files[0]);
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
    return !this.props.uploaded
      ? <div style={{ width: '100%' }}>
        <input type="file" accept="image/*" onChange={this.onChange} />

        <br style={{ clear: 'both' }} />
        {this.state.src &&
        <div>
          <AvatarEditor
            ref={this.setEditorRef}
            image={this.state.src}
            onSave={this.handleSave}
            borderRadius={10}
            width={250}
            height={250}
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
              Zoom:
              <input
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
            <button onClick={this.handleRightRotation}>RIGHT</button>
          </span>
          <br />
          <button onClick={this.handleSave} disabled={this.props.uploadPending}>
                UPLOAD
              </button>
          <br />
          {this.uploadPending && 'Uploading...'}

          {/*  <img
            src={this.state.preview}
            style={{ borderRadius: `${this.state.borderRadius / 2}%` }}
          />*/}
        </div>}
      </div>
      : <div><h2>UPLOAD FINISHED</h2></div>;
  }
}

export default ImageUpload;
