import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './MenuDrop.css';
import Box from '../Box';

class MenuDrop extends React.Component {
  static propTypes = {
    history: PropTypes.shape({}),
    intl: PropTypes.shape({}).isRequired,
    router: PropTypes.shape({}),
    store: PropTypes.shape({}),
    control: PropTypes.node.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    onClick: PropTypes.func.isRequired,
    align: PropTypes.shape({ right: PropTypes.string }),
  };

  static defaultProps = {
    history: null,
    router: null,
    store: null,
    align: null,
  };

  render() {
    const { control, children, onClick, align /* column */ } = this.props;
    /* const contents = [];
   if (control) {
      contents.push(
        React.cloneElement(control, { key: 'control', fill: true }),
      );
    } */
    // Put nested Menus inline
    const menuDropChildren = React.Children.map(children, child => {
      let result = child;
      if (child && child.type.prototype.renderMenuDrop) {
        result = React.cloneElement(child, {
          inline: 'expanded',
          direction: 'column',
        });
      }
      return result;
    });

    const contents = [
      <Box
        key="nav"
        ref={ref => (this.navContainerRef = ref)} // eslint-disable-line
        tag="nav"
        className={s.menu_contents}
        primary={false}
        column
      >
        {menuDropChildren}
      </Box>,
    ];
    const showControl =
      (align.top === 'top' || align.bottom === 'bottom') &&
      (align.left === 'left' || align.right === 'right');

    if (showControl && control) {
      contents.unshift(
        React.cloneElement(control, { key: 'control', fill: true }),
      );
    }
    return (
      <Box
        ref={ref => (this.menuDropRef = ref)} // eslint-disable-line
        onClick={onClick}
        column
        className={
          this.props.align.right ? s.menu_drop_right : s.menu_drop_left
        }
      >
        {contents}
      </Box>
    );
  }
}

export default withStyles(s)(MenuDrop);
