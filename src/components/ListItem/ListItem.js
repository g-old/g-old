import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './ListItem.css';
import Box from '../Box';

class ListItem extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    onClick: null,
  };

  render() {
    const { children, onClick } = this.props;
    return (
      <Box onClick={onClick} className={s.item} padVert tag="li">
        {children}
      </Box>
    );
  }
}

export default withStyles(s)(ListItem);
