// inspired by grommet

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Tabs.css';

class Tabs extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/require-default-props
    activeIndex: PropTypes.number,
    children: PropTypes.node,
    onActive: PropTypes.func,
  };
  static defaultProps = {
    children: null,
    onActive: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: props.activeIndex || 0,
    };
    this.activateTab = this.activateTab.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.activeIndex || nextProps.activeIndex === 0) &&
      this.state.activeIndex !== nextProps.activeIndex
    ) {
      this.setState({ activeIndex: nextProps.activeIndex });
    }
  }
  activateTab(index) {
    // eslint-disable-next-line no-prototype-builtins
    if (!this.props.hasOwnProperty('activeIndex')) {
      this.setState({ activeIndex: index });
    }
    if (this.props.onActive) {
      this.props.onActive(index);
    }
  }

  render() {
    const { children, ...props } = this.props;
    delete props.activeIndex; // ?
    const { activeIndex } = this.state;

    let activeContainer;
    const tabs = React.Children.map(
      children,
      (tab, index) => {
        if (!tab) return null;
        const tabProps = tab.props || {};
        const isTabActive = index === activeIndex;

        if (isTabActive) {
          activeContainer = tabProps.children;
        }
        return React.cloneElement(tab, {
          active: isTabActive,
          id: `tab-${index}`,
          onRequestForActive: () => {
            this.activateTab(index);
          },
        });
      },
      this,
    );

    return (
      <div role="tablist">
        <ul {...props} className={s.tabs}>
          {tabs}
        </ul>
        <div role="tabpanel">{activeContainer}</div>
      </div>
    );
  }
}

export default withStyles(s)(Tabs);
