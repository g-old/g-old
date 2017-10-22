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
  let src = thumbnail;
  if (stIndex > 0) {
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
    const url = avatar || thumbnail;
    if (url) {
      this.loadImage(getUrl(url));
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
        <Button plain onClick={onChange} disabled={updates && updates.pending}>
          <span className={s.uploadIcon}>
            <svg viewBox="0 0 24 24" width="32px" height="32px">
              <path
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                d={ICONS.editBig}
              />
            </svg>
          </span>
        </Button>
      );
      /*  uploadBnt = (
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
      ); */
    }
    let picture;
    if (this.state.image) {
      picture = (
        <img
          className={cn(s.avatar, this.state.loading ? s.imgSmall : s.loaded)}
          src={this.state.image}
          alt="IMG"
        />
      );
    } else {
      picture = (
        <svg
          version="1.1"
          viewBox="0 0 24 24"
          width="256px"
          height="256px"
          role="img"
          aria-label="user"
        >
          <path
            fill="none"
            stroke=""
            strokeWidth="2"
            d="M8,24 L8,19 M16,24 L16,19 M3,24 L3,19 C3,14.0294373 7.02943725,11 12,11 C16.9705627,11 21,14.0294373 21,19 L21,24 M12,11 C14.7614237,11 17,8.76142375 17,6 C17,3.23857625 14.7614237,1 12,1 C9.23857625,1 7,3.23857625 7,6 C7,8.76142375 9.23857625,11 12,11 Z"
          />
        </svg>
      );
    }
    return (
      <div className={cn(s.container, s.placeholder)}>
        {picture}
        <div className={s.overlay}>{uploadBnt}</div>
      </div>
    );
  }
}

export default withStyles(s)(ProfilePicture);
