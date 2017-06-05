import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Box.css';

class Box extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    onClick: PropTypes.func,
    clickable: PropTypes.bool,
    column: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    onClick: null,
    clickable: false,
    column: false,
    className: null,
  };

  render() {
    const { column, clickable, onClick } = this.props;
    /* eslint-disable jsx-a11y/no-static-element-interactions*/
    return (
      <div
        className={cn(
          s.root,
          this.props.className || null,
          column ? s.column : null,
          clickable ? s.clickable : null,
        )}
        onClick={onClick}
      >
        {this.props.children}
      </div>
    );
  }
}

export default withStyles(s)(Box);
