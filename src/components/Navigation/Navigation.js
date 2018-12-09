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
import cn from 'classnames';
import { getActivityCounter, getSessionUser } from '../../reducers';
import s from './Navigation.css';
import Link from '../Link';
import Menu from '../Menu';
import { canAccess } from '../../organization';
import { ICONS } from '../../constants';

const messages = defineMessages({
  feed: {
    id: 'navigation.feed',
    defaultMessage: 'Feed',
    description: 'Feed label',
  },
  about: {
    id: 'about',
    defaultMessage: 'About',
    description: 'About label',
  },
  proposals: {
    id: 'proposals',
    defaultMessage: 'Proposals',
    description: 'Proposals label',
  },
  admin: {
    id: 'navigation.admin',
    defaultMessage: 'Admin',
    description: 'Admin link in header',
  },
  surveys: {
    id: 'surveys',
    defaultMessage: 'Surveys',
    description: 'Surveys label',
  },
  profile: {
    id: 'profile',
    defaultMessage: 'Profile',
    description: 'Profile label',
  },
  users: {
    id: 'users',
    defaultMessage: 'Users',
    description: 'Users label',
  },
  workTeams: {
    id: 'workTeams',
    defaultMessage: 'Workteams',
    description: 'Workteam label',
  },
  notifications: {
    id: 'label.notifications',
    description: 'Notifications label',
    defaultMessage: 'Notifications',
  },
});

const contents = [
  { id: 1, path: '/feed', name: 'feed' },
  { id: 2, path: '/proposals/active', name: 'proposals' },
  { id: 3, path: '/surveys/active', name: 'surveys' },
  { id: 4, path: '/workteams', name: 'workTeams' },
  { id: 5, path: '/accounts', name: 'users' },
];

const makeLink = (linkData, currentPath, counter) => {
  const label = [
    <FormattedMessage key={linkData.id} {...messages[linkData.name]} />,
  ];
  if (linkData.name === 'feed' && counter.feed > 0) {
    label.unshift(<span className={s.news}>{`(${counter.feed}) `}</span>);
  }
  return (
    <Link //eslint-disable-line
      key={linkData.id}
      className={cn(s.link, currentPath === linkData.path ? s.current : null)}
      to={linkData.path}
    >
      {label}
    </Link>
  );
};

class Navigation extends React.Component {
  static propTypes = {
    activityCounter: PropTypes.shape({
      feed: PropTypes.number,
      proposals: PropTypes.number,
    }).isRequired,
    path: PropTypes.string.isRequired,
    user: PropTypes.shape({}),
  };

  static defaultProps = {
    user: null,
  };

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

  getMenu() {
    const { activityCounter, path, user } = this.props;

    const links = [];

    if (user && user.id) {
      links.push(contents.map(p => makeLink(p, path, activityCounter)));
    }
    links.push(
      makeLink({ id: 6, path: '/about', name: 'about' }, path, activityCounter),
    );
    if (canAccess(user, 'Admin')) {
      links.push(
        makeLink(
          { id: 7, path: '/admin', name: 'admin' },
          path,
          activityCounter,
        ),
      );
    }
    return links;
  }

  render() {
    const { path } = this.props;
    return (
      <span role="navigation" style={{ margin: '0 0.2em' }}>
        <div className={s.navBar}>{this.getMenu()}</div>

        <div className={s.menu}>
          <Link
            className={cn(
              s.link,
              s.navIcon,
              path.includes('/proposal') && s.active,
            )}
            to="/proposals/active"
          >
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              role="img"
              aria-label="proposal"
              width="24px"
              height="24px"
            >
              <path
                fill="none"
                strokeWidth="2"
                d="M16,7 L19,7 L19,11 L16,11 L16,7 Z M9,15 L20,15 M9,11 L13,11 M9,7 L13,7 M6,18.5 C6,19.8807119 4.88071187,21 3.5,21 C2.11928813,21 1,19.8807119 1,18.5 L1,7 L6.02493781,7 M6,18.5 L6,3 L23,3 L23,18.5 C23,19.8807119 21.8807119,21 20.5,21 L3.5,21"
              />
            </svg>
            <FormattedMessage {...messages.proposals} />
          </Link>
          <Link
            className={cn(
              s.link,
              s.navIcon,
              path.includes('/survey') && s.active,
            )}
            to="/surveys/active"
          >
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="proposal"
            >
              <path
                fill="none"
                strokeWidth="2"
                d="M16,7 L19,7 L19,11 L16,11 L16,7 Z M9,15 L20,15 M9,11 L13,11 M9,7 L13,7 M6,18.5 C6,19.8807119 4.88071187,21 3.5,21 C2.11928813,21 1,19.8807119 1,18.5 L1,7 L6.02493781,7 M6,18.5 L6,3 L23,3 L23,18.5 C23,19.8807119 21.8807119,21 20.5,21 L3.5,21"
              />
            </svg>
            <FormattedMessage {...messages.surveys} />
          </Link>
          <Link
            className={cn(
              s.link,
              s.navIcon,
              path.includes('/account') && s.active,
            )}
            to="/account"
          >
            <svg
              width="24px"
              height="24px"
              version="1.1"
              viewBox="0 0 24 24"
              role="img"
              aria-label="user"
            >
              <path fill="none" strokeWidth="2" d={ICONS.defaultAvatar} />
            </svg>
            <FormattedMessage {...messages.profile} />
          </Link>
          <Link className={cn(s.link, s.navIcon)} to="/feed">
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="menu"
            >
              <path fill="none" strokeWidth="2" d={ICONS.bell} />
            </svg>
            <span>News</span>
          </Link>
          <Link
            className={cn(
              s.link,
              s.navIcon,
              path.includes('/workteam') && s.active,
            )}
            to="/workteams"
          >
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="menu"
            >
              <path fill="none" strokeWidth="2" d={ICONS.workteam} />
            </svg>
            <FormattedMessage {...messages.workTeams} />
          </Link>
          <Menu
            withControl
            primary
            dropAlign={{ top: 'top', right: 'right' }}
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
          >
            {this.getMenu()}
          </Menu>
        </div>
      </span>
    );
  }
}

const mapToProps = state => ({
  activityCounter: getActivityCounter(state),
  path: state.ui.loading.path,
  user: getSessionUser(state),
});

export default connect(
  mapToProps,
  null,
)(withStyles(s)(Navigation));
