import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Button.css';

class Button extends React.Component {
  static propTypes = {
    label: PropTypes.element,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    primary: PropTypes.bool,
    accent: PropTypes.bool,
    plain: PropTypes.bool,
    children: PropTypes.element,
    fill: PropTypes.bool,
    reverse: PropTypes.bool,
    icon: PropTypes.element,
  };

  static defaultProps = {
    label: null,
    disabled: false,
    primary: false,
    accent: false,
    plain: false,
    children: null,
    fill: false,
    reverse: false,
    icon: null,
  };

  render() {
    const {
      label,
      icon,
      onClick,
      disabled,
      primary,
      accent,
      plain,
      reverse,
      children,
      fill,
    } = this.props;
    let buttonIcon;
    if (icon) {
      buttonIcon = <span className={s.icon}> {icon}</span>;
    }
    let buttonLabel;
    if (label) {
      buttonLabel = <span className={s.label}>{label}</span>;
    }
    const first = reverse ? buttonLabel : buttonIcon;
    const second = reverse ? buttonIcon : buttonLabel;
    return (
      <button
        className={cn(
          s.button,
          primary ? s.primary : null,
          accent ? s.accent : null,
          plain ? s.plain : null,
          fill ? s.fill : null,
          disabled ? s.disabled : null,
        )}
        disabled={disabled}
        onClick={onClick}
      >
        {first}
        {second}
        {children}
      </button>
    );
  }
}

export default withStyles(s)(Button);
