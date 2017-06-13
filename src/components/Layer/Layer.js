// from : https://github.com/grommet/grommet/blob/master/src/js/components/Layer.js

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import LayerContents from '../LayerContents';
import s from './Layer.css';

class Layer extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    id: PropTypes.string,
    children: PropTypes.element.isRequired,
  };
  static defaultProps = {
    id: null,
  };

  componentDidMount() {
    this.originalFocusedElement = document.activeElement;
    this.originalScrollPosition = {
      top: window.pageYOffset,
      left: window.pageXOffset,
    };
    this.addLayer();
    this.renderLayer();
  }

  componentDidUpdate() {
    this.renderLayer();
  }

  componentWillUnmount() {
    if (this.originalFocusedElement) {
      if (this.originalFocusedElement.focus) {
        // wait for the fixed positioning to come back to normal
        // see layer styling for reference
        setTimeout(() => {
          this.originalFocusedElement.focus();
          window.scrollTo(this.originalScrollPosition.left, this.originalScrollPosition.top);
        }, 0);
      } else if (
        this.originalFocusedElement.parentNode &&
        this.originalFocusedElement.parentNode.focus
      ) {
        // required for IE11 and Edge
        this.originalFocusedElement.parentNode.focus();
        window.scrollTo(this.originalScrollPosition.left, this.originalScrollPosition.top);
      }
    }

    this.removeLayer();
  }

  addLayer() {
    const { id } = this.props;

    const element = document.createElement('div');
    if (id) {
      element.id = id;
    }

    element.className = s.layer;
    const appElements = document.querySelectorAll('#app');
    let beforeElement;
    if (appElements.length > 0) {
      beforeElement = appElements[0];
    } else {
      beforeElement = document.body.firstChild;
    }
    if (beforeElement) {
      this.element = beforeElement.parentNode.insertBefore(element, beforeElement);
    }
  }

  removeLayer() {
    this.element.removeEventListener('animationend', this.onAnimationEnd);

    ReactDOM.unmountComponentAtNode(this.element);
    this.element.parentNode.removeChild(this.element);
    this.element = undefined;
  }
  renderLayer() {
    if (this.element) {
      this.element.className = s.layer;
      const contents = (
        <LayerContents className={s.container} context={this.context} onClose={this.props.onClose}>
          {this.props.children}
        </LayerContents>
      );
      ReactDOM.render(contents, this.element);
    }
  }

  render() {
    return <span style={{ display: 'none' }} />;
  }
}
Layer.contextTypes = {
  history: PropTypes.any,
  intl: PropTypes.any,
  router: PropTypes.any,
  store: PropTypes.any,
  insertCss: PropTypes.any,
};

export default withStyles(s)(Layer);
