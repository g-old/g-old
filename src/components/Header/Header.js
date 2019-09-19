/* eslint-disable react/jsx-props-no-spreading */
/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Header.css';
import Navigation from '../Navigation';
import UserStatus from '../UserStatus';
import NotificationMenu from '../NotificationMenu';

const messages = defineMessages({
  brand: {
    id: 'header.brand',
    defaultMessage: 'MyBrand',
    description: 'Brand name displayed in header',
  },
  bannerTitle: {
    id: 'header.banner.title',
    defaultMessage: 'V I P',
    description: 'Title in page header',
  },
});

class Header extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <UserStatus />
          <span className={s.brand}>
            <FormattedMessage {...messages.bannerTitle} />
          </span>
          <div className={s.right}>
            <Navigation />
            <NotificationMenu />
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Header);
