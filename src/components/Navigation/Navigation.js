/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import { getActivityCounter, getSessionUser } from '../../reducers';
import s from './Navigation.css';
import Link from '../Link';
import Button from '../Button';
import Box from '../Box';
import UserStatus from '../UserStatus';
import Search from '../Search';

const messages = defineMessages({
  feed: {
    id: 'navigation.feed',
    defaultMessage: 'Feed',
    description: 'Feed link in header',
  },
  about: {
    id: 'navigation.about',
    defaultMessage: 'About',
    description: 'About link in header',
  },

  admin: {
    id: 'navigation.admin',
    defaultMessage: 'Admin',
    description: 'Admin link in header',
  },

  profile: {
    id: 'navigation.profile',
    defaultMessage: 'Profile',
    description: 'Profile link in header',
  },
  /* users: {
    id: 'navigation.users',
    defaultMessage: 'All users',
    description: 'User list link in header',
  }, */
  groups: {
    id: 'navigation.users',
    defaultMessage: 'All workteams',
    description: 'Workteam list link in header',
  },
});

class Navigation extends React.Component {
  static propTypes = {
    activityCounter: PropTypes.shape({
      feed: PropTypes.number,
      proposals: PropTypes.number,
    }).isRequired,
    path: PropTypes.string.isRequired,
    user: PropTypes.shape({ rights: PropTypes.shape({}) }),
  };

  static defaultProps = {
    user: null,
  };

  constructor(props) {
    super(props);
    this.state = { navOpen: false };
    this.toggleNav = this.toggleNav.bind(this);
  }

  componentWillReceiveProps({ activityCounter }) {
    if (process.env.BROWSER && activityCounter.feed !== 0) {
      let oldTitle = document.title;
      const news = oldTitle.indexOf(')');
      if (news > -1) {
        oldTitle = oldTitle.substr(news + 2);
      }
      const notice = activityCounter.feed;

      document.title = `(${notice}) ${oldTitle}`;
    }
  }
  canSeeAdmin() {
    const { user } = this.props;
    if (user && user.rights.platform) {
      return true;
    }
    return false;
  }

  toggleNav() {
    this.setState({ navOpen: !this.state.navOpen });
  }
  render() {
    let navMenu;
    const { navOpen } = this.state;
    if (navOpen) {
      const canSee = this.canSeeAdmin();
      /* eslint-disable jsx-a11y/anchor-is-valid */
      navMenu = (
        <Box column>
          <Search
            fill
            placeHodler="Not implemented"
            value="Not implemented"
            suggestions={[]}
            onSelect={() => alert('TO IMPLEMENT')}
          />
          <div className={s.menu}>
            {canSee && (
              <Link to="/admin">
                <FormattedMessage {...messages.admin} />
              </Link>
            )}
          </div>
        </Box>
      );
      /* eslint-enable jsx-a11y/anchor-is-valid */
    }
    return (
      <Box className={s.root} pad column fill>
        <Box between>
          <UserStatus />
          {'GROUPNAME'}
          <Box>
            <Button
              plain
              icon={
                <svg
                  version="1.1"
                  viewBox="0 0 24 24"
                  width="24px"
                  height="24px"
                  role="img"
                  aria-label="notification"
                >
                  <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    d="M4,19 L4,9 C4,4.582 7.582,1 12,1 C16.418,1 20,4.582 20,9 L20,19 M1,19 L23,19 M15,19 L15,20 C15,21.657 13.657,23 12,23 C10.343,23 9,21.657 9,20 L9,19"
                  />
                </svg>
              }
            />
            <Button
              onClick={this.toggleNav}
              plain
              icon={
                <svg
                  version="1.1"
                  viewBox="0 0 24 24"
                  width="24px"
                  height="24px"
                  role="img"
                  aria-label="menu"
                >
                  <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    d="M2,19 L22,19 M2,5 L22,5 M2,12 L22,12"
                  />
                </svg>
              }
            />
          </Box>
        </Box>
        {navMenu}
      </Box>
    );
  }
}

const mapToProps = state => ({
  activityCounter: getActivityCounter(state),
  path: state.ui.loading.path,
  user: getSessionUser(state),
});

export default connect(mapToProps, null)(withStyles(s)(Navigation));
