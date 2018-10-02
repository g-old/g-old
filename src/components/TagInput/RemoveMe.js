import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable jsx-a11y/click-events-have-key-events,
jsx-a11y/no-static-element-interactions,
jsx-a11y/anchor-is-valid
*/

const RemoveMe = ({ onClick }) => (
  <a onClick={onClick}>{String.fromCharCode(215)}</a>
);
/* eslint-enable jsx-a11y/click-events-have-key-events,
jsx-a11y/no-static-element-interactions,
jsx-a11y/anchor-is-valid
*/

RemoveMe.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default RemoveMe;
