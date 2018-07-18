// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Box from '../Box';
import s from './Sidebar.css';

class Sidebar extends Component {
  render() {
    const { children, className, fixed, full, size, ...props } = this.props;
    const classes = classnames(
      s.sidebar,
      {
        [s.fixed]: fixed,
        [s.full]: full,
        [s.small]: size,
      },
      className,
    );

    return (
      <Box {...props} className={classes}>
        {children}
      </Box>
    );
  }
}

Sidebar.propTypes = {
  fixed: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'large']),
  full: PropTypes.bool,
  ...Box.propTypes,
};

Sidebar.defaultProps = {
  full: true,
  fixed: null,
  size: null,
};

export default withStyles(s)(Sidebar);
