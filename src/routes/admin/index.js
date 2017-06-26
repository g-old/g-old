/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';

const title = 'Admin Page';

export default {
  path: '/admin/',

  async action({ store, path }) {
    const user = getSessionUser(store.getState());
    if (!user) {
      return { redirect: `/?redirect=${path}` };
    } else if (!['admin', 'mod'].includes(user.role.type)) {
      return { component: <div> You have to login as admin or mod!</div> };
    }

    const Admin = await require.ensure([], require => require('./Admin').default, 'admin');

    return {
      title,
      chunk: 'admin',
      component: <Layout><Admin title={title} /></Layout>,
    };
  },
};
