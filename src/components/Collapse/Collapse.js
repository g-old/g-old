// Taken from https://github.com/grommet/grommet/blob/master/src/js/components/Collapsible.js

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ReactDOM from 'react-dom';
import s from './Collapse.css';
import Box from '../Box';

class Collapse extends React.Component {
  componentWillEnter(callback) {
    // TODO use ref instead!
    // eslint-disable-next-line react/no-find-dom-node
    const node = ReactDOM.findDOMNode(this);
    if (node) {
      const contentHeight = node.clientHeight;
      node.classList.remove(s.animate);
      node.style.height = 0;
      setTimeout(() => {
        node.classList.add(s.animate);
        node.style.height = `${contentHeight}px`;
        setTimeout(
          callback,
          parseFloat(getComputedStyle(node).transitionDuration) * 1000,
        );
      });
    }
  }

  componentDidEnter() {
    // eslint-disable-next-line react/no-find-dom-node
    const node = ReactDOM.findDOMNode(this);
    node.classList.remove(s.animate);
    node.style.height = '';
  }

  componentWillLeave(callback) {
    // eslint-disable-next-line react/no-find-dom-node
    const node = ReactDOM.findDOMNode(this);

    if (node) {
      const contentHeight = node.clientHeight;
      node.style.height = `${contentHeight}px`;
      setTimeout(() => {
        node.classList.add(s.animate);
        node.style.height = 0;
        setTimeout(
          callback,
          parseFloat(getComputedStyle(node).transitionDuration) * 1000,
        );
      });
    }
  }

  render() {
    return <Box {...this.props} className={s.collapse} />;
  }
}

export default withStyles(s)(Collapse);
