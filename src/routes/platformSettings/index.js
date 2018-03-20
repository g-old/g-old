/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import AdminPage from '../../containers/AdminPage';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'Admin';

async function action({ store }) {
  const state = await store.getState();
  const user = getSessionUser(state);

  if (user) {
    if (!canAccess(user, title)) {
      return { redirect: '/admin' };
    }
  }
  const links = [{ to: 'settings/add', name: 'Add' }];

  return {
    chunks: ['admin'],
    title,
    component: <AdminPage menuLinks={links}>i am the Settings page</AdminPage>,
  };
}

export default action;
