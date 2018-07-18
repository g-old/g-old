/*
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './MainNav.css';
import Box from '../Box';
import Link from '../Link';
import Menu from '../Menu0';

class MainNav extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  render() {
    let titleElement = this.props.icon;
    const leftAnchor = 'LEFTACNHOR';
    const pageMenu = [
      { id: 1, path: '/feed', name: 'feed' },
      { id: 2, path: '/proposals/active', name: 'proposals' },
      { id: 3, path: '/surveys', name: 'surveys' },
      { id: 4, path: '/admin', name: 'admin' },
      { id: 5, path: '/about', name: 'about' },
    ];

    const navLinks = [
      { id: 1, path: '/feed', name: 'feed', role: [] },
      { id: 2, path: '/proposals/active', name: 'proposals', role: [] },
      { id: 3, path: '/surveys', name: 'surveys', role: [] },
      { id: 4, path: '/admin', name: 'admin', role: [] },
      { id: 5, path: '/about', name: 'about', role: [] },
    ];
    const onLogoutClick = () => {};
    const user = { role: 'role' };
    return (
      <Box tag="header" justify="between" pad align>
        {leftAnchor ? <Box>{leftAnchor}</Box> : <Box align>{titleElement}</Box>}
        <Box align pad>
          <Menu label="Menu" inline direction="row">
            {pageMenu && pageMenu.length ? (
              <Menu label="Page Types">
                {pageMenu.map((item, i) => (
                  <Link key={item.id} to={item.path}>
                    {item.name}
                  </Link>
                ))}
              </Menu>
            ) : null}
            {navLinks &&
              navLinks.map((item, i) => {
                if (item.type && item.type === 'Menu') {
                  if (!item.role.includes('user.role')) {
                    return null;
                  }
                  return (
                    <Menu key={i} label="Admin">
                      {item.children.map(child =>
                        child.role.map(
                          itemRole =>
                            itemRole === 'user.role' && (
                              <Link
                                key={i}
                                className={
                                  location.pathname === child.path
                                    ? 'active'
                                    : ''
                                }
                                path={child.path}
                                label={child.label}
                              />
                            ),
                        ),
                      )}
                    </Menu>
                  );
                }
                return item.role.map(
                  itemRole =>
                    itemRole === user.role && (
                      <Link key={i} path={item.path} label={item.label} />
                    ),
                );
              })}
          </Menu>
          <Menu responsive icon={'IMAGE'}>
            <Link to={`/dashboard/users/${user._id}`}>Change Password</Link>
            <Link target="_blank" to="https://grommet.github.io/grommet-cms">
              Docs
            </Link>
            <Link onClick={onLogoutClick}>Sign Out</Link>
          </Menu>
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(MainNav);
*/
