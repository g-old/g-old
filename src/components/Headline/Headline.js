import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Headline.css';

class Headline extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
  };

  render() {
    const { children } = this.props;
    return <div className={cn(s.headline, s.medium)}>{children}</div>;
  }
}

export default withStyles(s)(Headline);
