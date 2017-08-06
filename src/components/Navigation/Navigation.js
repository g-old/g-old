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
import { getActivityCounter } from '../../reducers';
import s from './Navigation.css';
import Link from '../Link';
import Menu from '../Menu';
import Icon from '../Icon';
import { ICONS } from '../../constants';

const messages = defineMessages({
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

const getMenu = (className, counter) =>
  (<div className={className}>
    <Link className={s.link} to="/feed">
      {counter.feed > 0 &&
        <span className={s.news}>
          {`(${counter.feed}) `}
        </span>}
      {'Feed'}
    </Link>
    <Link className={s.link} to="/proposals/active">
      {counter.proposals > 0 &&
        <span className={s.news}>
          {'NEW '}
        </span>}
      <FormattedMessage {...messages.proposals} />
    </Link>
    <Link className={s.link} to="/surveys">
      <FormattedMessage {...messages.surveys} />
    </Link>
    <Link className={s.link} to="/admin">
      <FormattedMessage {...messages.admin} />
    </Link>
    <Link className={s.link} to="/about">
      <FormattedMessage {...messages.about} />
    </Link>
  </div>);

class Navigation extends React.Component {
  static propTypes = {
    activityCounter: PropTypes.shape({ feed: PropTypes.number, proposals: PropTypes.number })
      .isRequired,
  };

  componentWillReceiveProps({ activityCounter }) {
    if (process.env.BROWSER && (activityCounter.feed !== 0 || activityCounter.proposals !== 0)) {
      let oldTitle = document.title;
      const news = oldTitle.indexOf(')');
      if (news > -1) {
        oldTitle = oldTitle.substr(news + 2);
      }
      const notice =
        activityCounter.feed > activityCounter.proposals
          ? activityCounter.feed
          : activityCounter.proposals;
      document.title = `(${notice}) ${oldTitle}`;
    }
  }
  render() {
    return (
      <div className={s.root} role="navigation">
        {getMenu(s.navBar, this.props.activityCounter)}
        <div className={s.menu}>
          <Menu withControl icon={<Icon icon={ICONS.menu} size={20} color="grey" />}>
            {getMenu(s.menuContent, this.props.activityCounter)}
          </Menu>
        </div>
      </div>
    );
  }
}

const mapToProps = state => ({
  activityCounter: getActivityCounter(state),
});

export default connect(mapToProps, null)(withStyles(s)(Navigation));
