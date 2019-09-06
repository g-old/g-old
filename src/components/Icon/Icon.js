// from: https://medium.com/@david.gilbertson/icons-as-react-components-de3e33cb8792

import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ color, size, vBox, icon, transform }) => {
  const styles = {
    svg: {
      display: 'inline-block',
      verticalAlign: 'middle',
    },
    path: {
      fill: color,
    },
  };
  // viewBox is a hack - should be 1024 1024
  return (
    <svg
      style={styles.svg}
      width={`${size}px`}
      height={`${size}px`}
      viewBox={`0 0 ${vBox} ${vBox}`}
    >
      <path style={styles.path} d={icon} transform={transform} />
    </svg>
  );
};

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  vBox: PropTypes.number,
  transform: PropTypes.string,
};

Icon.defaultProps = {
  size: 32,
  color: 'inherit',
  vBox: 32,
  transform: '',
};

export default Icon;
