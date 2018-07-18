/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormattedMessage, defineMessages } from 'react-intl';
import Login from '../../components/Login';
import s from './Home.css';
import history from '../../history';
import Button from '../../components/Button';

const messages = defineMessages({
  signup: {
    id: 'label.signup',
    defaultMessage: 'Sign Up',
    description: 'Label signup',
  },
  or: {
    id: 'label.or',
    defaultMessage: 'OR',
    description: 'Label or',
  },
});

class Home extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <div className={s.box}>
          <div className={s.formGroup}>
            <Button
              fill
              primary
              label={<FormattedMessage {...messages.signup} />}
              onClick={() => {
                history.push('/signup');
              }}
            />
          </div>
          {
            <strong className={s.lineThrough}>
              <FormattedMessage {...messages.or} />{' '}
            </strong>
          }
          <Login />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Home);
