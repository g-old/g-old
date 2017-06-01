import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Button.css';

class Button extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    primary: PropTypes.bool,
    accent: PropTypes.bool,
    plain: PropTypes.bool,
    children: PropTypes.element,
    fill: PropTypes.bool,
  };
  static defaultProps = {
    label: null,
    disabled: false,
    primary: false,
    accent: false,
    plain: false,
    children: null,
    fill: false,
  };
  render() {
    const { label, onClick, disabled, primary, accent, plain, children, fill } = this.props;

    return (
      <button
        className={cn(
          s.mainButton,
          primary ? s.primary : null,
          accent ? s.accent : null,
          plain ? s.plain : null,
          fill ? s.fill : null,
        )}
        disabled={disabled}
        onClick={onClick}
      >
        <span>{label}</span>
        {children}
      </button>
    );
  }
}

export default withStyles(s)(Button);
