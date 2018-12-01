import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ListItem.css';
import Box from '../Box';

class ListItem extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
  };

  static defaultProps = {
    onClick: null,
    className: null,
  };

  render() {
    const { children, onClick, className } = this.props;
    const classes = cn(s.item, className);
    return (
      <Box onClick={onClick} className={classes} padVert tag="li">
        {children}
      </Box>
    );
  }
}

export default withStyles(s)(ListItem);
