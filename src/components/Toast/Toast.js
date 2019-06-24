import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import { IntlProvider } from 'react-intl';
import { Provider as ReduxProvider } from 'react-redux';

// eslint-disable-next-line css-modules/no-unused-class
import s from './Toast.css';
import ToastContents from './ToastContents';

class Toast extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    id: null,
    onClose: null,
  };

  static contextTypes = {
    intl: IntlProvider.childContextTypes.intl,
    insertCss: PropTypes.func,
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
  };

  static childContextTypes = {
    intl: IntlProvider.childContextTypes.intl,
    insertCss: PropTypes.func,
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
  };

  getChildContext() {
    return this.context;
  }

  componentDidMount() {
    this.addLayer();
    this.renderLayer();
  }

  componentDidUpdate() {
    this.renderLayer();
  }

  componentWillUnmount() {
    this.removeLayer();
  }

  onClose() {
    const { onClose } = this.props;
    this.removeLayer();
    if (onClose) {
      onClose();
    }
  }

  addLayer() {
    const { id } = this.props;

    const element = document.createElement('div');
    if (id) {
      element.id = id;
    }
    element.className = s.container;
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
    if (this.element) {
      ReactDOM.unmountComponentAtNode(this.element);
      this.element.parentNode.removeChild(this.element);
      this.element = undefined;
    }
  }

  renderLayer() {
    if (this.element) {
      this.element.className = s.container;
      const { insertCss, intl, store } = this.context; // TODO change to a single provider
      const contents = (
        <StyleContext.Provider value={{ insertCss }}>
          <ReduxProvider store={store}>
            <ToastContents
              {...this.props}
              intl={intl}
              onClose={() => this.onClose()}
            />
          </ReduxProvider>
        </StyleContext.Provider>
      );
      ReactDOM.render(contents, this.element);
    }
  }

  render() {
    return <span style={{ display: 'none' }} />;
  }
}

export default withStyles(s)(Toast);
