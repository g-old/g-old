import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './GroupThumbnail.css';
import Link from '../Link';

const GroupThumbnail = ({ group, label }) =>
  group ? ( // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link to={`/workteams/${group.id}`} className={cn(s.root)}>
      <img src={group.icon} alt="" />
      {label}
      <span>{group.displayName}</span>
    </Link>
  ) : (
    label
  );

GroupThumbnail.propTypes = {
  group: PropTypes.shape({}).isRequired,
  label: PropTypes.string,
};
GroupThumbnail.defaultProps = {
  label: null,
};

export default withStyles(s)(GroupThumbnail);
