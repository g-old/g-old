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
import { getActivityCounter } from '../../reducers';
import s from './Navigation.css';
import Link from '../Link';
import Menu from '../Menu';

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
  proposals: {
    id: 'navigation.proposals',
    defaultMessage: 'Proposals',
    description: 'Proposals link in header',
  },
  admin: {
    id: 'navigation.admin',
    defaultMessage: 'Admin',
    description: 'Admin link in header',
  },
  surveys: {
    id: 'navigation.surveys',
    defaultMessage: 'Surveys',
    description: 'Surveys link in header',
  },
});

const contents = [
  { id: 1, path: '/feed', name: 'feed' },
  { id: 2, path: '/proposals/active', name: 'proposals' },
  { id: 3, path: '/surveys', name: 'surveys' },
  { id: 4, path: '/admin', name: 'admin' },
  { id: 5, path: '/about', name: 'about' },
];

const getMenu = (counter, path) =>
  contents.map(p => {
    const children = [<FormattedMessage key={0} {...messages[p.name]} />];
    if (p.name === 'feed' && counter.feed > 0) {
      children.unshift(<span className={s.news}>{`(${counter.feed}) `}</span>);
    }

    return (
      <Link
        key={p.id}
        className={cn(s.link, path === p.path ? s.current : null)}
        to={p.path}
      >
        {children}
      </Link>
    );
  });

class Navigation extends React.Component {
  static propTypes = {
    activityCounter: PropTypes.shape({
      feed: PropTypes.number,
      proposals: PropTypes.number,
    }).isRequired,
    path: PropTypes.string.isRequired,
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
  render() {
    return (
      <div role="navigation">
        <div className={s.navBar}>
          {getMenu(this.props.activityCounter, this.props.path)}
        </div>
        <div className={s.menu}>
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
            {getMenu(this.props.activityCounter, this.props.path || '')}
          </Menu>
        </div>
      </div>
    );
  }
}

const mapToProps = state => ({
  activityCounter: getActivityCounter(state),
  path: state.ui.loading.path,
});

export default connect(mapToProps, null)(withStyles(s)(Navigation));
