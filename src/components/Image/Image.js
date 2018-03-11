import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import s from './Image.css'; // eslint-disable-line css-modules/no-unused-class

class Image extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    full: PropTypes.bool,
    size: PropTypes.bool,
    fit: PropTypes.bool,
    thumb: PropTypes.bool,
  };
  static defaultProps = {
    className: null,
    full: null,
    size: null,
    fit: null,
    thumb: null,
  };

  render() {
    const { thumb, full, size, fit, className, ...otherProps } = this.props;
    const classes = classnames(
      s.image,
      {
        [s.thumb]: thumb,
        [s[size]]: size,
        [s.fit]: fit,
        [s.full]: fit ? true : typeof full === 'boolean' && full,
      },
      className,
    );
    // eslint-disable-next-line jsx-a11y/alt-text
    const imgNode = <img {...otherProps} className={classes} />;

    return imgNode;
  }
}

export default withStyles(s)(Image);
