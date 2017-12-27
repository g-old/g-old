import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Button from '../Button';
// eslint-disable-next-line css-modules/no-unused-class
import s from './Toast.css';

const ANIMATION_DURATION = 1000;
class ToastContents extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    intl: PropTypes.shape({}).isRequired,
    children: PropTypes.node.isRequired,
    insertCss: PropTypes.func.isRequired,
    duration: PropTypes.number,
  };
  static defaultProps = {
    onClose: null,
    duration: 0,
  };
  static childContextTypes = {
    intl: PropTypes.shape({}),
    insertCss: PropTypes.func,
  };
  constructor() {
    super();
    this.onClose = this.onClose.bind(this);
    this.state = {};
  }

  getChildContext() {
    return {
      intl: this.props.intl,
      insertCss: this.props.insertCss,
    };
  }
  componentDidMount() {
    const { duration } = this.props;
    if (duration) {
      this.timer = setTimeout(this.onClose, duration);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  onClose() {
    const { onClose } = this.props;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.setState({ closing: true });
    if (onClose) {
      setTimeout(onClose, ANIMATION_DURATION);
    }
  }

  render() {
    const { onClose, children } = this.props;
    const { closing } = this.state;

    let closeControl;
    if (onClose) {
      closeControl = (
        <Button
          plain
          onClick={this.onClose}
          icon={
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
          }
        />
      );
    }
    return (
      <div className={cn(s.toast, closing ? s.close : null)}>
        <div className={s.contents}>{children}</div>
        {closeControl}
      </div>
    );
  }
}

export default ToastContents;
