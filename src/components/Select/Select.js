// heavily inspired by grommet:
// https://github.com/grommet/grommet/blob/master/src/js/components/Select.js

/*  eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { injectIntl, intlShape } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Select.css';
import Button from '../Button';
import Drop from '../Drop';

const valueEqualsOption = (value, option) => {
  let result = false;
  if (value && typeof value === 'object') {
    if (option && typeof option === 'object') {
      result = value.value === option.value;
    } else {
      result = value.value === option;
    }
  } else if (option && typeof option === 'object') {
    result = value === option.value;
  } else {
    result = value === option;
  }
  return result;
};

const normalizeValue = props => {
  const { multiple, value } = props;
  let normalizedValue = value;
  if (multiple) {
    if (value) {
      if (!Array.isArray(value)) {
        normalizedValue = [value];
      }
    } else {
      normalizedValue = [];
    }
  }
  return normalizedValue;
};

const renderLabel = option => {
  if (option && typeof option === 'object') {
    return option.label || option.value || '';
  }
  return option || '';
};

const optionSelected = (option, value) => {
  let result = false;
  if (value && Array.isArray(value)) {
    result = value.some(val => valueEqualsOption(val, option));
  } else {
    result = valueEqualsOption(value, option);
  }
  return result;
};

const valueType = PropTypes.oneOfType([
  PropTypes.shape({
    label: PropTypes.node,
    value: PropTypes.any,
  }),
  PropTypes.string,
  PropTypes.number,
]);
class Select extends React.Component {
  static propTypes = {
    options: PropTypes.arrayOf(valueType).isRequired,
    value: PropTypes.oneOfType([valueType, PropTypes.arrayOf(valueType)]),
    onChange: PropTypes.func.isRequired,
    placeHolder: PropTypes.string,
    multiple: PropTypes.bool,
    inField: PropTypes.bool,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    value: '',
    placeHolder: '',
    multiple: false,
    inField: false,
  };
  constructor(props) {
    super(props);
    this.onAddDrop = this.onAddDrop.bind(this);
    this.onRemoveDrop = this.onRemoveDrop.bind(this);
    this.onClickOption = this.onClickOption.bind(this);
    this.renderOptions = this.renderOptions.bind(this);
    this.valueForSelectedOption = this.valueForSelectedOption.bind(this);

    this.state = { dropActive: false, activeOptionIndex: -1 };
  }

  componentWillReceiveProps(nextProps) {
    // eslint-disable-next-line no-prototype-builtins
    if (nextProps.hasOwnProperty('value')) {
      this.setState({ value: normalizeValue(nextProps) });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { dropActive } = this.state;

    if (!dropActive && prevState.dropActive) {
      document.removeEventListener('click', this.onRemoveDrop);

      if (this.drop) {
        this.drop.remove();
        this.drop = undefined;
      }
    }

    if (dropActive && !prevState.dropActive) {
      document.addEventListener('click', this.onRemoveDrop);
      const control = this.props.inField
        ? this.componentRef.parentNode.parentNode
        : this.componentRef;
      this.drop = new Drop(control, this.renderOptions(), {
        align: { top: 'bottom', left: 'left' },
        context: this.context,
        responsive: false,
        className: s.drop,
      });
    } else if (dropActive && prevState.dropActive) {
      // this.drop.render(this.renderOptions());
      // TODO check why this throws
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onRemoveDrop);
    if (this.drop) {
      this.drop.remove();
    }
  }
  onClickOption(option) {
    const { onChange } = this.props;
    const value = this.valueForSelectedOption(option);
    this.setState({ dropActive: false, value });
    if (onChange) {
      onChange({ target: this.inputRef, option, value });
    }
  }

  onAddDrop(e) {
    e.preventDefault();
    const { options, value } = this.props;
    const optionValues = options.map(o => {
      if (o && typeof o === 'object') {
        return o.value;
      }
      return o;
    });

    const activeIndex = optionValues.indexOf(value);
    this.setState({ dropActive: true, activeOptionIndex: activeIndex });
  }

  onRemoveDrop() {
    this.setState({ dropActive: false });
  }

  valueForSelectedOption(option) {
    const { multiple } = this.props;
    const { value } = this.state;
    let nextValue;
    if (multiple) {
      nextValue = value.slice(0);
      let index;
      for (index = 0; index < nextValue.length; index += 1) {
        if (valueEqualsOption(nextValue[index], option)) {
          break;
        }
      }
      if (index < nextValue.length) {
        // already existing, remove
        nextValue.splice(index, 1);
      } else {
        // not there, add
        nextValue.push(option);
      }
    } else {
      nextValue = option;
    }
    return nextValue;
  }
  // eslint-disable-next-line consistent-return
  renderValue(option) {
    if (Array.isArray(option)) {
      if (option.length === 1) {
        return this.renderValue(option[0]);
      } else if (option.length > 1) {
        return `Selected ${option.length}`; // TODO FormattedMessage
      }
    } else if (option && typeof option === 'object') {
      if (option.label.props) {
        return this.props.intl.formatMessage({ ...option.label.props });
      }
      return option.label || option.value || '';
    } else {
      return undefined === option || option === null ? '' : option;
    }
  }

  renderOptions() {
    let items;
    const { options, value } = this.props;
    const { activeOptionIndex } = this.state;
    if (options) {
      items = options.map((option, index) => {
        const selected = optionSelected(option, value);

        const content = renderLabel(option);
        // eslint-disbale-line
        const itemOnClick = this.onClickOption.bind(this, option);
        return (
          <li // eslint-disable-line
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={cn(
              selected ? s.selected : null,
              index === activeOptionIndex ? s.active : null,
              s.select_option,
            )}
            onClick={itemOnClick} // eslint-disable-line
          >
            {content}
          </li>
        );
      });
    }

    return (
      <div className={s.select_drop}>
        {/* eslint-disable */}
        <ol onClick={this.onRemoveDrop} className={s.options}>
          {items}
        </ol>
        {/* eslint-enable */}
      </div>
    );
  }

  render() {
    const { placeHolder, value } = this.props;
    return (
      <div // eslint-disable-line
        ref={ref => (this.componentRef = ref)} // eslint-disable-line
        className={s.select}
        onClick={this.onAddDrop}
      >
        <input // eslint-disable-next-line
          ref={ref => (this.inputRef = ref)}
          className={s.input}
          placeholder={placeHolder}
          readOnly
          value={this.renderValue(value)}
        />
        <Button
          className={s.select_control}
          plain
          icon={
            <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
              <polygon
                fill="none"
                stroke="#000"
                strokeWidth="2"
                points="22 8 12 20 2 8"
              />
            </svg>
          }
        />
      </div>
    );
  }
}

Select.contextTypes = {
  intl: PropTypes.object,
};

export default withStyles(s)(injectIntl(Select));
