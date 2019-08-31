import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';

class DropContents extends React.Component {
  static propTypes = {
    context: PropTypes.shape({}).isRequired,
    content: PropTypes.shape({}).isRequired,
  };

  static childContextTypes = {
    history: PropTypes.shape({}),
    intl: intlShape,
    onDropChange: PropTypes.func,
    router: PropTypes.node,
    store: PropTypes.node,
    insertCss: PropTypes.func,
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
