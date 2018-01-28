import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Box.css'; // eslint-disable-line css-modules/no-unused-class

class Box extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    clickable: PropTypes.bool,
    column: PropTypes.bool,
    className: PropTypes.string,
    pad: PropTypes.bool,
    tag: PropTypes.string,
    align: PropTypes.bool,
    containerClassName: PropTypes.string,
    justify: PropTypes.bool,
    wrap: PropTypes.bool,
    flex: PropTypes.bool,
    between: PropTypes.bool,
    padding: PropTypes.string,
    fill: PropTypes.bool,
  };

  static defaultProps = {
    children: null,
    onClick: null,
    clickable: false,
    column: false,
    className: null,
    pad: false,
    tag: 'div',
    align: false,
    containerClassName: null,
    justify: false,
    wrap: false,
    flex: false,
    between: false,
    padding: null,
    fill: null,
  };

  render() {
    const {
      tag,
      column,
      children,
      clickable,
      onClick,
      pad,
      className,
      containerClassName,
      align,
      justify,
      wrap,
      flex,
      between,
      padding,
      fill,
    } = this.props;

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    const Component = tag;

    return (
      <Component
        className={cn(
          s.root,
          className || null,
          containerClassName || null,
          column ? s.column : null,
          clickable ? s.clickable : null,
          pad ? s.pad : null,
          align ? s.align : null,
          justify ? s.justify : null,
          wrap ? s.wrap : null,
          flex ? s.flex : null,
          between ? s.between : null,
          fill ? s.fill : null,
          {
            [s[padding]]: padding,
          },
        )}
        onClick={onClick}
      >
        {children}
      </Component>
    );
  }
}

export default withStyles(s)(Box);
