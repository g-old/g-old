import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './UserThumbnail.css';
import Link from '../Link';
import Avatar from '../Avatar';

const UserThumbnail = ({ user, label, marked, big, noLink }) => {
  const fullName = user ? `${user.name} ${user.surname}` : '';

  return user ? ( // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link
      to={!noLink && `/accounts/${user.id}`}
      className={cn(marked && s.mark, s.root, big && s.big)}
    >
      <Avatar user={user} className={s.thumbnail} />
      {label}
      <span>{fullName}</span>
    </Link>
  ) : (
    label
  );
};

UserThumbnail.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    surname: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
  label: PropTypes.string,
  marked: PropTypes.string,
  big: PropTypes.string,
  noLink: PropTypes.bool,
};
UserThumbnail.defaultProps = {
  label: null,
  marked: null,
  big: null,
  noLink: null,
};

export default withStyles(s)(UserThumbnail);
