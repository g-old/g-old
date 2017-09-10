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
import Admin from './Admin';
import { PRIVILEGES } from '../../constants';

const title = 'Admin Page';

const canAccess = user => {
  if (user.role && user.role.type && user.privilege) {
    if (['admin', 'mod'].includes(user.role.type)) {
      return true;
    }
    /* eslint-disable no-bitwise */
    if (
      user.privilege & PRIVILEGES.canModifyRights ||
      user.privilege & PRIVILEGES.canUnlockViewer
    ) {
      return true;
    }
    /* eslint-enable no-bitwise */
  }
  return false;
};

async function action({ store, path }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user)) {
    return { component: <div> You have to login as admin or mod!</div> };
  }

  return {
    title,
    chunks: ['admin'],
    component: (
      <Layout>
        <Admin title={title} />
      </Layout>
    ),
  };
}

export default action;
