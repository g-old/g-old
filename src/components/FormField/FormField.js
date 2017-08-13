// https://github.com/grommet/grommet/blob/master/src/js/components/FormField.js

import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FormField.css';

class FormField extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    error: PropTypes.node,
    label: PropTypes.node,
    help: PropTypes.node,
    overflow: PropTypes.bool,
  };
  static defaultProps = {
    error: null,
    label: null,
    help: null,
    overflow: false,
  };

  constructor(props) {
    super(props);
    this.state = { focus: false };
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    const contentsElement = this.contentsRef;
    if (contentsElement) {
      const inputElements = contentsElement.querySelectorAll('input, textarea, select');
      if (inputElements.length === 1) {
        this.inputElement = inputElements[0];
        this.inputElement.addEventListener('focus', this.onFocus);
        this.inputElement.addEventListener('blur', this.onBlur);
      }
    }
  }

  componentWillUnmount() {
    if (this.inputElement) {
      this.inputElement.removeEventListener('focus', this.onFocus);
      this.inputElement.removeEventListener('blur', this.onBlur);
      delete this.inputElement;
    }
  }

  onFocus() {
    this.setState({ focus: true });
  }

  onBlur() {
    this.setState({ focus: false });
  }

  onClick() {
    if (this.inputElement) {
      this.inputElement.focus();
    }
  }

  render() {
    const { error, children, label, help, overflow } = this.props;
    const fieldError = error
      ? (<span className={s.field_error}>
        {error}
      </span>)
      : undefined;
    const fieldHelp = help
      ? (<span className={s.help}>
        {help}
      </span>)
      : undefined;
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div
        onClick={this.onClick}
        className={cn(
          s.field,
          error ? s.error : null,
          this.state.focus ? s.focus : null,
          overflow ? s.overflow : null,
        )}
      >
        {fieldError}
        {label}
        {fieldHelp}
        <span ref={ref => (this.contentsRef = ref)} className={s.contents}>
          {children}
        </span>
      </div>
    );
  }
}

export default withStyles(s)(FormField);
