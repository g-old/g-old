// inspired by https://github.com/FormidableLabs/react-progressive-image/blob/master/index.js

import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProfilePicture.css';
import Button from '../Button';
import { ICONS } from '../../constants';

const getUrl = thumbnail => {
  const stIndex = thumbnail.indexOf('c_scale');
  let src;
  if (stIndex) {
    // has thumbnailUrl
    const endIndex = stIndex + 18; // (!)
    src = thumbnail.slice(0, stIndex) + thumbnail.substring(endIndex);
  }
  return src;
};
class ProfilePicture extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      avatar: PropTypes.string,
      thumbnail: PropTypes.string,
    }).isRequired,
    canChange: PropTypes.bool,
    updates: PropTypes.shape({}).isRequired,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    canChange: false,
  };
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      image: props.user.avatar ? props.user.avatar : props.user.thumbnail,
    };
    this.onLoad = this.onLoad.bind(this);
    this.onError = this.onError.bind(this);
    this.loadImage = this.loadImage.bind(this);
  }

  componentDidMount() {
    const { user: { thumbnail, avatar } } = this.props;
    if (!avatar) {
      this.loadImage(getUrl(thumbnail));
    }
  }

  componentWillReceiveProps(nextProps) {
    const { user: { avatar, thumbnail } } = nextProps;
    if (thumbnail !== this.props.user.thumbnail) {
      if (!avatar) {
        this.setState({ image: thumbnail, loading: true }, () => {
          this.loadImage(getUrl(thumbnail));
        });
      } else {
        this.setState({ image: avatar, loading: false });
      }
    }
  }

  componentWillUnmount() {
    if (this.image) {
      this.image.onload = null;
      this.image.onerror = null;
    }
  }

  onLoad() {
    this.setState({
      image: this.image.src,
      loading: false,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  onError() {
    console.error('Could not load image');
  }
  loadImage(src) {
    if (src) {
      if (this.image) {
        this.image.onLoad = null;
        this.image.onError = null;
      }
      const image = new Image();
      this.image = image;
      image.onload = this.onLoad;
      image.onerror = this.onError;
      image.src = src;
    }
  }

  render() {
    let uploadBnt = null;
    const { canChange, updates, onChange } = this.props;
    if (canChange) {
      uploadBnt = (
        <Button
          icon={
            <svg viewBox="0 0 24 24" width="24px" height="24px">
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d={ICONS.editBig}
              />
            </svg>
          }
          plain
          onClick={onChange}
          disabled={updates && updates.pending}
        />
      );
    }
    return (
      <div className={cn(s.container, s.placeholder)}>
        <img
          className={cn(s.avatar, this.state.loading ? s.imgSmall : s.loaded)}
          src={this.state.image}
          alt="IMG"
        />
        <div className={s.overlay}>{uploadBnt}</div>
      </div>
    );
  }
}

export default withStyles(s)(ProfilePicture);
