import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// eslint-disable-next-line css-modules/no-unused-class
import s from './Toast.css';
import ToastContents from './ToastContents';

class Toast extends React.Component {
  static propTypes = {
    id: PropTypes.string,
  };
  static defaultProps = {
    id: null,
  };
  static contextTypes = {
    intl: PropTypes.object,
    insertCss: PropTypes.func,
  };

  static childContextTypes = {
    intl: PropTypes.object,
    insertCss: PropTypes.func,
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
      beforeElement = appElements[0];
    } else {
      beforeElement = document.body.firstChild;
    }
    if (beforeElement) {
      this.element = beforeElement.parentNode.insertBefore(element, beforeElement);
    }
  }

  removeLayer() {
    ReactDOM.unmountComponentAtNode(this.element);
    this.element.parentNode.removeChild(this.element);
    this.element = undefined;
  }
  renderLayer() {
    if (this.element) {
      this.element.className = s.container;
      const contents = (
        <ToastContents
          {...this.props}
          intl={this.context.intl}
          store={this.context.store}
          insertCss={this.context.insertCss}
        />
      );
      ReactDOM.render(contents, this.element);
    }
  }

  render() {
    return <span style={{ display: 'none' }} />;
  }
}

export default withStyles(s)(Toast);
