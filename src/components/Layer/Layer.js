// from : https://github.com/grommet/grommet/blob/master/src/js/components/Layer.js

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/withStyles';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import { Provider as ReduxProvider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import cn from 'classnames';
import LayerContents from '../LayerContents';
import s from './Layer.css';

class Layer extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    id: PropTypes.string,
    hidden: PropTypes.bool,
    fill: PropTypes.bool,
  };

  static defaultProps = {
    id: null,
    hidden: false,
    fill: false,
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
    const { hidden } = this.props;
    if (this.originalFocusedElement && !hidden) {
      if (this.originalFocusedElement.focus) {
        // wait for the fixed positioning to come back to normal
        // see layer styling for reference
        setTimeout(() => {
          this.originalFocusedElement.focus();
          window.scrollTo(
            this.originalScrollPosition.left,
            this.originalScrollPosition.top,
          );
        }, 0);
      } else if (
        this.originalFocusedElement.parentNode &&
        this.originalFocusedElement.parentNode.focus
      ) {
        // required for IE11 and Edge
        this.originalFocusedElement.parentNode.focus();
        window.scrollTo(
          this.originalScrollPosition.left,
          this.originalScrollPosition.top,
        );
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
      [beforeElement] = appElements;
    } else {
      beforeElement = document.body.firstChild;
    }
    if (beforeElement) {
      this.element = beforeElement.parentNode.insertBefore(
        element,
        beforeElement,
      );
    }
  }

  removeLayer() {
    this.element.removeEventListener('animationend', this.onAnimationEnd);

    ReactDOM.unmountComponentAtNode(this.element);
    this.element.parentNode.removeChild(this.element);
    this.element = undefined;
    this.handleAriaHidden(true);
  }

  handleAriaHidden(hideOverlay) {
    setTimeout(() => {
      const hidden = hideOverlay || false;
      const apps = document.querySelectorAll('#app');
      const visibleLayers = document.querySelectorAll(
        `.${s.layer}:not(.${s.hidden})`,
      );

      if (apps) {
        /* eslint-disable no-param-reassign */
        Array.prototype.slice.call(apps).forEach(app => {
          if (hidden && visibleLayers.length === 0) {
            // make sure to only show grommet apps if there is no other layer
            app.setAttribute('aria-hidden', false);
            app.classList.remove(s.hidden);
            // scroll body content to the original position
            app.style.top = `-${this.originalScrollPosition.top}px`;
            app.style.left = `-${this.originalScrollPosition.left}px`;
          } else {
            app.setAttribute('aria-hidden', true);
            app.classList.add(s.hidden);
            // this must be null to work
            app.style.top = null;
            app.style.left = null;
            //  app.style.top = `-${this.originalScrollPosition.top}px`;
            //  app.style.left = `-${this.originalScrollPosition.left}px`;
          }
        }, this);
        /* eslint-enable no-param-reassign */
      }
    }, 0);
  }

  renderLayer() {
    if (this.element) {
      this.element.className = s.layer;
      const { insertCss, store, intl } = this.context;
      const { onClose, fill } = this.props;
      const contents = (
        <StyleContext.Provider value={{ insertCss }}>
          <ReduxProvider store={store}>
            <LayerContents
              {...this.props}
              className={cn(s.container, fill && s.fill)}
              intl={intl}
              onClose={onClose}
            />
          </ReduxProvider>
        </StyleContext.Provider>
      );
      ReactDOM.render(contents, this.element, () => {
        const { hidden } = this.props;
        if (hidden) {
          this.handleAriaHidden(true);
        } else {
          this.handleAriaHidden(false);
        }
      });
    }
  }

  render() {
    return null;
  }
}

Layer.contextTypes = {
  insertCss: PropTypes.func.isRequired,
  intl: IntlProvider.childContextTypes.intl,
  locale: PropTypes.string,
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
  }),
};

export default withStyles(s)(Layer);
