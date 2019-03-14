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

const title = 'Private';

async function action({ store }) {
  const state = store.getState();

  const user = getSessionUser(state);

  if (user) {
    if (!canAccess(user, title)) {
      return { redirect: '/account' };
    }
  } else {
    return { redirect: '/home' };
  }
  return {
    chunks: ['private'],
    title,
    component: <Layout>Private Area</Layout>,
  };
}

export default action;
