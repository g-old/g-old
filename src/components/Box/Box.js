import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Box.css';

class Button extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
  };

  render() {
    return (
      <div className={cn(s.root)}>
        {this.props.children}
      </div>
    );
  }
}

export default withStyles(s)(Button);
