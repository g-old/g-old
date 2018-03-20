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
import { canAccess } from '../../organization';
import AdminPage from '../../containers/AdminPage';

const title = 'Admin';

async function action({ store, path }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return {
      component: (
        <Layout>
          <div> You have to login as admin or mod!</div>{' '}
        </Layout>
      ),
    };
  }

  const links = [
    { to: 'admin/platform', name: 'SETTINGS' },
    { to: 'admin/users', name: 'USERS' },
    { to: 'admin/groups', name: 'GROUPS' },
  ];

  return {
    title,
    chunks: ['admin'],
    component: (
      <AdminPage menuLinks={links}>
        {'i am the default admin platform content'}
      </AdminPage>
    ),
  };
  /*  <Layout>
        <Admin title={title}>{'i am the default platform content'}</Admin>
      </Layout> */
}

export default action;
