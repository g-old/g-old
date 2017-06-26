import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MenuDrop.css';
import Box from '../Box';

class MenuDrop extends React.Component {
  static propTypes = {
    history: PropTypes.shape({}),
    intl: PropTypes.shape({}).isRequired,
    router: PropTypes.shape({}),
    store: PropTypes.shape({}),
    insertCss: PropTypes.func.isRequired,
    control: PropTypes.node.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
    onClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    history: null,
    router: null,
    store: null,
  };
  getChildContext() {
    return {
      intl: this.props.intl,
      history: this.props.history,
      router: this.props.router,
      store: this.props.store,
      insertCss: this.props.insertCss,
    };
  }
  render() {
    const { control, children, onClick } = this.props;
    const contents = [];
    if (control) {
      contents.push(React.cloneElement(control, { key: 'control', fill: true }));
    }
    contents.push(
      <Box
        key="nav"
        ref={ref => (this.navContainerRef = ref)}
        tag="nav"
        className={s.menu_contents}
        column
      >
        {children}
      </Box>,
    );

    return (
      <Box
        ref={ref => (this.menuDropRef = ref)}
        onClick={onClick}
        column
        clickable
        className={s.menu_drop}
      >
        {contents}
      </Box>
    );
  }
}
MenuDrop.childContextTypes = {
  history: PropTypes.any,
  intl: PropTypes.any,
  router: PropTypes.any,
  store: PropTypes.any,
  insertCss: PropTypes.any,
};

export default withStyles(s)(MenuDrop);
