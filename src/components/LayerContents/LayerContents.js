import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';

class LayerContents extends React.Component {
  static childContextTypes = {
    history: PropTypes.object,
    intl: PropTypes.object,
    onDropChange: PropTypes.func,
    router: PropTypes.any,
    store: PropTypes.object,
    insertCss: PropTypes.func,
  };
  static propTypes = {
    context: PropTypes.shape({}).isRequired,
    children: PropTypes.element.isRequired,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
  };
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }
  getChildContext() {
    const { context } = this.props;
    return { ...context };
  }
  render() {
    const { onClose, children, className } = this.props;
    return (
      <div className={className}>
        <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 1, margin: '12px' }}>
          <Button
            onClick={onClose}
            plain
            icon={
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
                aria-label="close"
              >
                <path fill="none" stroke="#000" strokeWidth="2" d="M3,3 L21,21 M3,21 L21,3" />
              </svg>
            }
          />
        </div>
        {children}
      </div>
    );
  }
}

LayerContents.contextTypes = {
  history: PropTypes.any,
  intl: PropTypes.any,
  router: PropTypes.any,
  store: PropTypes.any,
  insertCss: PropTypes.any,
};

export default LayerContents;
