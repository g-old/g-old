import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Box from '../Box';

class Header extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: null,
  };

  render() {
    const { children, className } = this.props;

    return (
      <Box>
        <Box
          tag="header"
          className={cn(s.header, className || null)}
          containerClassName={s.container}
        >
          {children}
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(Header);
