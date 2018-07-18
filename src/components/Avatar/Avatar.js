import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Avatar.css';

function Avatar(props) {
  if (props.user.thumbnail) {
    return (
      <img
        className={props.isFollowee ? s.followee : s.avatar}
        src={props.user.thumbnail}
        alt={props.user.name}
      />
    );
  }
  return (
    <svg
      version="1.1"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      role="img"
      aria-label="user"
    >
      <path
        fill="none"
        stroke="#000"
        strokeWidth="2"
        d="M8,24 L8,19 M16,24 L16,19 M3,24 L3,19 C3,14.0294373 7.02943725,11 12,11 C16.9705627,11 21,14.0294373 21,19 L21,24 M12,11 C14.7614237,11 17,8.76142375 17,6 C17,3.23857625 14.7614237,1 12,1 C9.23857625,1 7,3.23857625 7,6 C7,8.76142375 9.23857625,11 12,11 Z"
      />
    </svg>
  );
}

Avatar.propTypes = {
  user: PropTypes.shape({
    thumbnail: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  isFollowee: PropTypes.bool,
};

Avatar.defaultProps = {
  isFollowee: false,
};

export default withStyles(s)(Avatar);
