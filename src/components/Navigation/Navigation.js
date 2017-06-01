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
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';

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
});

class Navigation extends React.Component {
  render() {
    return (
      <div className={s.root} role="navigation">
        <Link className={s.link} to="/about">
          <FormattedMessage {...messages.about} />
        </Link>
        <Link className={s.link} to="/proposals/active">
          <FormattedMessage {...messages.proposals} />
        </Link>
        <Link className={s.link} to="/feed">
          Feed
        </Link>
        <Link className={s.link} to="/admin">
          <FormattedMessage {...messages.admin} />
        </Link>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
