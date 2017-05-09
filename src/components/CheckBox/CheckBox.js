import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CheckBox.css';

// https://github.com/grommet/grommet/blob/master/src/js/components/CheckBox.js
class CheckBox extends React.Component {
  static propTypes = {
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    label: PropTypes.node,
    name: PropTypes.string,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    checked: false,
    disabled: false,
    label: 'No label',
    onChange: () => {
      alert('Changed');
    },
    name: 'name',
  };
  render() {
    const { checked, disabled, name, label, onChange } = this.props;

    const labelNode = label; /* (
      <label key="label" htmlFor={name} className={s.label}>
        {label}
      </label>
    ); */
    let hidden;
    if (disabled && checked) {
      hidden = <input name={name} type="hidden" value="true" />;
    }

    const children = [
      <span key="checkbox">
        <input
          className={s.input}
          tabIndex="0"
          name={name}
          type="checkbox"
          disabled={disabled}
          checked={checked}
          onChange={onChange}
        />
        <span className={s.control}>
          <svg className={s.check} viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
            <path fill="none" d="M6,11.3 L10.3,16 L18,6.2" />
          </svg>
        </span>
      </span>,
      labelNode,
    ];

    return (
      /* eslint-disable jsx-a11y/label-has-for */
      (
        <label className={s.checkBox}>

          {children}
          {hidden}
        </label>
      )
      /* eslint-enable jsx-a11y/label-has-for */
    );
  }
}

export default withStyles(s)(CheckBox);
