import React from 'react';
import PropTypes from 'prop-types';

class DropContents extends React.Component {
  static propTypes = {
    context: PropTypes.shape({}).isRequired,
    content: PropTypes.shape({}).isRequired,
  };
  static childContextTypes = {
    history: PropTypes.object,
    intl: PropTypes.object,
    onDropChange: PropTypes.func,
    router: PropTypes.any,
    store: PropTypes.object,
  };

  getChildContext() {
    const { context } = this.props;
    return { ...context };
  }
  render() {
    const { content } = this.props;
    return <div>{content}</div>;
  }
}

export default DropContents;
