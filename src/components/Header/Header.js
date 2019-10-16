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
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import cn from 'classnames';
import s from './Header.css';
import Navigation from '../Navigation';
import UserStatus from '../UserStatus';
import NotificationMenu from '../NotificationMenu';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import Link from '../Link';

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
    const { user, small } = this.props;
    return (
      <div className={cn(s.root, small && s.small)}>
        <div className={s.container}>
          {user && <UserStatus />}
          <Link to="/">
            <span className={s.brand}>
              <img alt="logo" className={s.logo} src="/tile.png" />
              {/*              <FormattedMessage {...messages.bannerTitle} />
               */}{' '}
            </span>
          </Link>
          <div className={s.right}>
            <LanguageSwitcher />
            <Navigation small={small} />
            <NotificationMenu />
          </div>
        </div>
      </div>
    );
  }
}
Header.propTypes = {
  user: PropTypes.shape({}),
  small: PropTypes.bool.isRequired,
};

Header.defaultProps = {
  user: null,
};

export default withStyles(s)(Header);
