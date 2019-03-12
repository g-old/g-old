import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import classnames from 'classnames';
import s from './Heading.css';

class Heading extends React.Component {
  static propTypes = {
    tag: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    strong: PropTypes.bool,
  };

  static defaultProps = {
    className: null,
    strong: null,
  };

  render() {
    const { tag: Tag, children, className, strong } = this.props;
    const classes = classnames(s.heading, className, strong ? s.strong : null);
    return <Tag className={classes}> {children}</Tag>;
  }
}

export default withStyles(s)(Heading);
