import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import s from './Uploader.css';
import Box from '../Box';
import Button from '../Button';
import Image from '../Image';
import Label from '../Label';

function supportsDragDrop(document) {
  if (document) {
    const element = document.createElement('div');
    return (
      'draggable' in element ||
      ('ondragstart' in element && 'ondrop' in element)
    );
  }
  return false;
}

function getFileTransfer(event, allowMultiple) {
  let items = [];
  if (event.dataTransfer) {
    const { dataTransfer } = event;
    if (dataTransfer.files && dataTransfer.files.length) {
      items = dataTransfer.files;
    } else if (dataTransfer.items && dataTransfer.items.length) {
      items = dataTransfer.items; // eslint-disable-line
    }
  } else if (event.target && event.target.files) {
    items = event.target.files;
  }

  if (items.length > 0) {
    if (allowMultiple) {
      return Array.prototype.slice.call(items);
    }
    return [items[0]];
  }
  return [];
}

class Uploader extends React.Component {
  static propTypes = {
    fullDropTarget: PropTypes.bool.isRequired,
    files: PropTypes.arrayOf(PropTypes.shape({})),
    onClick: PropTypes.func,
    multiple: PropTypes.bool.isRequired,
    onDOMChange: PropTypes.func,
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
    uploadPending: PropTypes.bool.isRequired,
  };
  static defaultProps = {
    files: null,
    onClick: null,
    onDOMChange: null,
    className: null,
  };

  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.onClearFilePreview = this.onClearFilePreview.bind(this);
    this.onCancelFileDrop = this.onCancelFileDrop.bind(this);
    this.state = {
      dragActive: false,
      dragDropSupported: false,
      files: [],
    };
  }

  componentWillMount() {
    if (process.browser) {
      const dragDropSupported = document ? supportsDragDrop(document) : false;
      this.setState({
        dragDropSupported,
      });
    }
  }

  componentDidMount() {
    if (window) {
      const { fullDropTarget } = this.props;
      if (fullDropTarget) {
        window.addEventListener('drop', this.onDrop);
        window.addEventListener('dragover', this.onDragOver);
        window.addEventListener('dragenter', this.onDragEnter);
        window.addEventListener('dragleave', this.onDragLeave);
      } else {
        window.addEventListener('drop', this.onCancelFileDrop);
        window.addEventListener('dragover', this.onCancelFileDrop);
      }
    }
  }

  componentWillReceiveProps({ files }) {
    if (files && files !== this.props.files) {
      this.setState({
        files,
      });
    }
  }
  componentWillUnmount() {
    if (window) {
      const { fullDropTarget } = this.props;
      if (fullDropTarget) {
        window.removeEventListener('drop', this.onDrop);
        window.removeEventListener('dragover', this.onDragOver);
        window.removeEventListener('dragenter', this.onDragEnter);
        window.removeEventListener('dragleave', this.onDragLeave);
      } else {
        window.removeEventListener('dragover', this.onCancelFileDrop);
        window.removeEventListener('drop', this.onCancelFileDrop);
      }
    }
  }

  onClick(e) {
    const { onClick } = this.props;
    e.stopPropagation();
    this.onOpen();
    if (typeof onClick === 'function') {
      onClick();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onCancelFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  onClearFilePreview(i, e) {
    if (this.props.uploadPending) return;
    const { files } = this.state;
    const newFiles = [...files.slice(0, i), ...files.slice(i + 1)];
    this.setState({
      files: newFiles,
    });
    if (typeof this.props.onDOMChange === 'function') {
      this.props.onDOMChange.call(this, newFiles, e); // eslint-disable-line
    }
  }

  onOpen() {
    const fileInput = findDOMNode(this.input); // eslint-disable-line
    if (fileInput && !this.props.uploadPending) {
      fileInput.value = null;
      fileInput.click();
    }
  }

  onDrop(e) {
    e.preventDefault();

    const { multiple, onDOMChange, uploadPending } = this.props;
    if (uploadPending) return;
    const files = getFileTransfer(e, multiple);
    files.forEach(file => {
      if (window) {
        file.preview = window.URL.createObjectURL(file); // eslint-disable-line
      }
    });
    const newFiles = multiple ? [...this.state.files, ...files] : files;
    if (typeof onDOMChange === 'function' && files.length) {
      onDOMChange.call(this, newFiles, e);
    }
    this.setState({
      dragActive: false,
      files: newFiles,
    });
  }

  onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    // bugfix to make sure box gets highlighted
    if (!this.state.dragActive) {
      this.setState({
        dragActive: true,
      });
    }

    return false;
  }
  // eslint-disable-next-line class-methods-use-this
  onDragEnter(e) {
    e.preventDefault();
  }

  onDragLeave(e) {
    e.preventDefault();
    this.setState({
      dragActive: false,
    });
  }

  renderPreview(files) {
    if (!files.length) {
      return null;
    }
    return (
      <Box justify flex wrap>
        {files.map((item, i) => (
          <div
            key={i} // eslint-disable-line
            pad="none"
            margin={{ horizontal: 'small' }}
            className={s.preview}
          >
            <Button
              plain
              a11yTitle="Clear image preview"
              onClick={this.onClearFilePreview.bind(this, i)} // eslint-disable-line
              className={s.closerBtn}
              icon="X"
            />
            <Image size="thumb" src={item.preview} />
          </div>
        ))}
      </Box>
    );
  }

  render() {
    const {
      className,
      label,
      multiple,
      uploadPending,
      ...boxProps
    } = this.props;
    const { dragActive, files, dragDropSupported } = this.state;
    const classes = classnames(
      s.uploader,
      {
        [s.active]: dragActive,
      },
      className,
    );

    return (
      <Box align justify className={s.container} column>
        {dragDropSupported ? (
          <Box
            justify
            {...boxProps}
            onDrop={this.onDrop}
            onDragEnter={this.onDragEnter}
            onDragOver={this.onDragOver}
            onDragLeave={this.onDragLeave}
            onClick={this.onClick}
            className={classes}
          >
            <Label>{label || ''}</Label>
          </Box>
        ) : (
          <Button label={label} onClick={this.onClick} />
        )}

        <input
          ref={input => (this.input = input)} // eslint-disable-line
          multiple={
            multiple // eslint-disable-line
          }
          onChange={this.onDrop}
          type="file"
          className={s.input}
          accept="image/*"
        />
        {this.renderPreview(files)}
      </Box>
    );
  }
}

export default withStyles(s)(Uploader);
