import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import s from './TableRow.css';

class TableRow extends React.Component {
  static propTypes = {
    children: PropTypes.element,
    className: PropTypes.string,
    onClick: PropTypes.func,
  };
  static defaultProps = {
    children: null,
    className: null,
    onClick: null,
  };

  render() {
    const { children, className, onClick, ...props } = this.props;

    const classes = classnames(
      {
        [s.selectable]: onClick,
      },
      className,
    );

    return (
      <tr {...props} className={classes} onClick={onClick}>
        {children}
      </tr>
    );
  }
}

export default withStyles(s)(TableRow);
