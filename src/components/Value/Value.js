import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Value.css';

class Value extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    icon: PropTypes.node,
    value: PropTypes.number,
    units: PropTypes.string,
    trendIcon: PropTypes.node,
  };

  static defaultProps = {
    label: null,
    icon: null,
    value: null,
    units: null,
    trendIcon: null,
  };
  render() {
    const { label, icon, value, units, trendIcon } = this.props;

    const contentNode = <div> {icon}<span className={s.value}>{value}</span> {units}</div>;

    return (
      <div className={s.container}>
        <div className={s.valueContainer}>{contentNode} {trendIcon}</div>{label}
      </div>
    );
  }
}

export default withStyles(s)(Value);
