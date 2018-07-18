import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Title.css';
import Box from '../Box';

class Title extends React.Component {
  render() {
    const {
      a11yTitle,
      children,
      className,
      truncate,
      small,
      ...props
    } = this.props;
    const classes = classnames(
      s.title,
      {
        [s.truncate]: truncate,
        [s.interactive]: props.onClick,
        [s.small]: small,
      },
      className,
    );

    const boxTitle = a11yTitle || 'No title';

    let content;
    if (typeof children === 'string') {
      content = <span>{children}</span>;
    } else if (Array.isArray(children)) {
      content = children.map((child, index) => {
        if (child && typeof child === 'string') {
          // eslint-disable-next-line react/no-array-index-key
          return <span key={index}>{child}</span>;
        }
        return child;
      });
    } else {
      content = children;
    }

    return (
      <Box
        {...props}
        align
        responsive={false}
        className={classes}
        a11yTitle={boxTitle}
      >
        {content}
      </Box>
    );
  }
}

Title.propTypes = {
  a11yTitle: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  truncate: PropTypes.bool,
  children: PropTypes.node,
  small: PropTypes.string,
};

Title.defaultProps = {
  a11yTitle: null,
  onClick: null,
  truncate: true,
  children: null,
  className: null,
  small: null,
};

export default withStyles(s)(Title);
