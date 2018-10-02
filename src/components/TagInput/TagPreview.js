import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

const TagPreview = ({ className, text, onClick, children }) => (
  <span className={className} onClick={onClick}>
    {text}
    {children}
  </span>
);
/* eslint-enable jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events, */
TagPreview.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
  children: PropTypes.element,
};

TagPreview.defaultProps = {
  children: null,
};

export default TagPreview;
