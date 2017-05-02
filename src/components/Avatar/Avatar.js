import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Avatar.css';

function Avatar(props) {
  return <img className={s.avatar} src={props.user.avatar} alt={props.user.name} />;
}

Avatar.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default withStyles(s)(Avatar);
