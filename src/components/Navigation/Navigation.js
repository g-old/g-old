/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';

const messages = defineMessages({
  about: {
    id: 'navigation.about',
    defaultMessage: 'About',
    description: 'About link in header',
  },
});

class Navigation extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    const { className } = this.props;
    return (
      <div className={cx(s.root, className)} role="navigation">
        <Link className={s.link} to="/about">
          <FormattedMessage {...messages.about} />
        </Link>
        <Link className={s.link} to="/proposals/active">
          Proposals
        </Link>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
