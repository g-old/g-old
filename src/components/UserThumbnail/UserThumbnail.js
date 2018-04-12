import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserThumbnail.css';
import Link from '../Link';

const UserThumbnail = ({ user, label }) => {
  const fullName = user ? `${user.name} ${user.surname}` : '';
  return user ? (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link to={`/accounts/${user.id}`} className={s.root}>
      <img src={user.thumbnail} alt={fullName} />
      {label}
      <span>{fullName}</span>
    </Link>
  ) : (
    label
  );
};

UserThumbnail.propTypes = {
  user: PropTypes.shape({}).isRequired,
  label: PropTypes.string,
};
UserThumbnail.defaultProps = {
  label: null,
};

export default withStyles(s)(UserThumbnail);
