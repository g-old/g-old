import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import TransitionGroup from 'react-addons-transition-group'; // 'react-transition-group/TransitionGroup';
import s from './Collapsible.css';

import Box from '../Box';
import Collapse from '../Collapse';

class Collapsible extends React.Component {
  static propTypes = {
    animate: PropTypes.bool,
    children: PropTypes.element.isRequired,
    active: PropTypes.bool,
  };

  static defaultProps = {
    animate: true,
    active: false,
  };

  render() {
    const Component = this.props.animate ? TransitionGroup : Box;
    return (
      <Component className={s.wrapper}>
        {this.props.active && <Collapse>{this.props.children}</Collapse>}
      </Component>
    );
  }
}

export default withStyles(s)(Collapsible);
