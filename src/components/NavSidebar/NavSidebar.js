import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './NavSidebar.css';
import Sidebar from '../Sidebar';
import Link from '../Link';

class NavSidebar extends React.Component {
  _onClose() {
    this.props.dispatch(navActivate(false));
  }

  render() {
    const {
      nav: { items },
      title,
    } = this.props;
    const links = items.map(page => <Link to={page.path}>{page.label}</Link>);
    return (
      <Sidebar>
        <div className={s.header}>
          <div className={s.title} onClick={this.onClose}>
            <span>{title}</span>
          </div>
          <button onClick={this.onClose}>Close</button>
        </div>
        <div className={s.menu}>{links}</div>
        <div className={s.footer}>//TODO Logout-menu</div>
      </Sidebar>
    );
  }
}

export default withStyles(s)(NavSidebar);
