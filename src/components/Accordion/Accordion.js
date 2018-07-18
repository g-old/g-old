// Heavily inspired by grommet

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Accordion.css';

class Accordion extends React.Component {
  static propTypes = {
    openMulti: PropTypes.bool,
    active: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    children: PropTypes.node,
    onActive: PropTypes.func,
  };

  static defaultProps = {
    openMulti: false,
    active: null,
    onActive: null,
    children: null,
  };

  constructor(props) {
    super(props);
    this.onPanelChange = this.onPanelChange.bind(this);
    let active;
    if (Number.isInteger(this.props.active)) {
      active = [this.props.active];
    } else {
      active = this.props.active || [];
    }
    this.state = {
      active,
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.active !== this.props.active) {
      this.setState({ active: newProps.active || [] });
    }
  }

  onPanelChange(index) {
    let active = [...this.state.active];
    const { onActive, openMulti } = this.props;
    const activeIndex = active.indexOf(index);
    if (activeIndex > -1) {
      active.splice(activeIndex, 1);
    } else if (openMulti) {
      active.push(index);
    } else {
      active = [index];
    }
    this.setState({ active }, () => {
      if (onActive) {
        if (!openMulti) {
          onActive(active[0]);
        } else {
          onActive(active);
        }
      }
    });
  }

  render() {
    const { children } = this.props;
    const accordionChildren = React.Children.map(children, (child, index) =>
      React.cloneElement(child, {
        active: this.state.active.indexOf(index) > -1,
        onChange: () => this.onPanelChange(index),
      }),
    );

    return <ul className={s.list}>{accordionChildren}</ul>;
  }
}

export default withStyles(s)(Accordion);
