// Inspired by grommet: https://github.com/grommet/grommet/blob/master/src/js/components/AccordionPanel.js

import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './AccordionPanel.css';

class AccordionPanel extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    active: PropTypes.bool.isRequired,
    onActive: PropTypes.func,
    heading: PropTypes.node.isRequired,
    children: PropTypes.node,
  };
  static defaultProps = {
    onChange: null,
    onActive: null,
    children: [],
  };
  constructor(props) {
    super(props);
    this.onClickTab = this.onClickTab.bind(this);
  }
  onClickTab(e) {
    const { onChange } = this.props;
    if (e) {
      e.preventDefault();
    }
    onChange();
    if (!this.props.active && this.props.onActive) {
      this.props.onActive();
    }
  }

  render() {
    const { children, heading, active } = this.props;
    const label = (
      <svg viewPort="0 0 24 24" width="24px" height="24px">
        <polygon fill="none" stroke="#000" strokeWidth="2" points="6 2 18 12 6 22" />
      </svg>
    );
    return (
      <div>
        <li className={s.listItem}>
          <button className={s.button} onClick={this.onClickTab}>
            <div className={s.box}>
              <header className={cn(s.header, s.box)}>
                {heading}
                {label}
              </header>
            </div>
          </button>
        </li>
        <div className={cn(active ? s.open : s.closed)}>
          {children}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(AccordionPanel);
