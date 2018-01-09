import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import s from './Image.css'; // eslint-disable-line

class Image extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    full: PropTypes.bool,
    fit: PropTypes.string,
    size: PropTypes.string,
  };
  static defaultProps = {
    className: null,
    full: null,
    fit: null,
    size: null,
  };

  render() {
    const { className, full, size, fit, ...otherProps } = this.props;
    const classes = classnames(
      s.image,
      {
        [s[size]]: size,
        [s[fit]]: fit,
        [s.full]: fit ? true : typeof full === 'boolean' && full,
      },
      className,
    );

    const imgNode = <img alt="asset" {...otherProps} className={classes} />;

    return imgNode;
  }
}

export default withStyles(s)(Image);
