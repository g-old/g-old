import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';

class LayerContents extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    intl: PropTypes.shape({}).isRequired,
    insertCss: PropTypes.func.isRequired,
    store: PropTypes.func.isRequired,
    overlayClose: PropTypes.bool,
  };

  static defaultProps = {
    overlayClose: null,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.onClickOverlay = this.onClickOverlay.bind(this);
    this.setRef = this.setRef.bind(this);
  }

  getChildContext() {
    const { intl, insertCss, store } = this.props;
    return {
      intl,
      insertCss,
      store,
    };
  }

  componentDidMount() {
    const { onClose, overlayClose } = this.props;
    if (onClose && overlayClose) {
      const layerParent = this.containerRef.parentNode;
      layerParent.addEventListener('click', this.onClickOverlay);
    }
  }

  onClickOverlay(event) {
    const { dropActive } = this.state;
    if (!dropActive) {
      const { onClose } = this.props;
      const layerContents = this.containerRef;

      if (layerContents && !layerContents.contains(event.target)) {
        onClose();
      }
    }
  }

  setRef(ref) {
    this.containerRef = ref;
  }

  render() {
    const { onClose, children, className } = this.props;
    let closeNode = null;
    if (onClose) {
      closeNode = (
        <div
          ref={this.setRef}
          style={
            { position: 'absolute', top: 0, right: 0, zIndex: 1 } // eslint-disable-line
          }
        >
          <Button onClick={onClose} plain>
            <span style={{ padding: '10px', display: 'inline-block' }}>
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
                aria-label="close"
              >
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d="M3,3 L21,21 M3,21 L21,3"
                />
              </svg>
            </span>
          </Button>
        </div>
      );
    }
    return (
      <div className={className}>
        {closeNode}
        {children}
      </div>
    );
  }
}

LayerContents.childContextTypes = {
  history: PropTypes.shape({}),
  intl: PropTypes.node,
  store: PropTypes.shape({}),
  insertCss: PropTypes.func,
};

export default LayerContents;
