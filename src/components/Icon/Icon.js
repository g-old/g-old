// from: https://medium.com/@david.gilbertson/icons-as-react-components-de3e33cb8792

import React from 'react';
import PropTypes from 'prop-types';

const Icon = (props) => {
  const styles = {
    svg: {
      display: 'inline-block',
      verticalAlign: 'middle',
    },
    path: {
      fill: props.color,
    },
  };
  // viewBox is a hack - should be 1024 1024
  return (
    <svg
      style={styles.svg}
      width={`${props.size}px`}
      height={`${props.size}px`}
      viewBox={`0 0 ${props.vBox} ${props.vBox}`}
    >
      <path style={styles.path} d={props.icon} transform={props.transform} />
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
