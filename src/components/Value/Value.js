import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './Value.css';

class Value extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    icon: PropTypes.node,
    value: PropTypes.number,
    units: PropTypes.string,
    trendIcon: PropTypes.node,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    label: null,
    icon: null,
    value: null,
    units: null,
    trendIcon: null,
    onClick: null,
  };
  render() {
    const { label, icon, value, units, trendIcon, onClick } = this.props;

    const contentNode = (
      <div>
        {icon}
        <span className={s.value}>{value}</span> {units}
      </div>
    );

    return (
      // eslint-disable-next-line
      <div
        role="button"
        className={cn(s.container, onClick && s.clickable)}
        onClick={onClick}
      >
        <div className={s.valueContainer}>
          {contentNode} {trendIcon}
        </div>
        {label}
      </div>
    );
  }
}

export default withStyles(s)(Value);
