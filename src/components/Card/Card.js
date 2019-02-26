import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Card.css';

const Card = ({ children, className }) => (
  <div className={cn(s.root, className)}>{children}</div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
Card.defaultProps = {
  className: null,
};

export default withStyles(s)(Card);
