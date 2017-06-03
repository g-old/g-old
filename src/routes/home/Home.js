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
import Login from '../../components/Login';
import s from './Home.css';
import history from '../../history';

class Home extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <div className={s.box}>
          <div className={s.formGroup}>
            <button
              className={s.button}
              onClick={() => {
                history.push('/signup');
              }}
            >
              Sign up
            </button>
          </div>
          <strong className={s.lineThrough}>OR</strong>
          <Login />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Home);
