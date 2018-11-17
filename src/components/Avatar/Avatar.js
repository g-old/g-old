/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* @flow */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './Avatar.css';
import { ICONS } from '../../constants';

type Props = {
  user: UserShape,
  isFollowee?: boolean,
  className?: string,
  onClick?: ({ id: ID }) => void,
};

function Avatar({ user, isFollowee, className, onClick }: Props) {
  const classNames = cn(
    {
      [s.followee]: isFollowee,
      [s.default]: !className,
      [s.clickable]: onClick,
    },
    className,
  );
  if (user.thumbnail) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <img
        onClick={onClick}
        className={classNames}
        src={user.thumbnail}
        alt={user.name}
      />
    );
  }
  return (
    <svg
      onClick={onClick}
      className={classNames}
      version="1.1"
      viewBox="0 0 24 24"
      role="img"
      aria-label="user"
    >
      <path fill="none" strokeWidth="2" d={ICONS.defaultAvatar} />
    </svg>
  );
}

Avatar.defaultProps = {
  isFollowee: false,
  className: null,
  onClick: null,
};

export default withStyles(s)(Avatar);
