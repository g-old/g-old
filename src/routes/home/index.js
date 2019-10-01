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
import Home from './Home';
import { getSessionUser } from '../../reducers';
import { canAccess, ApprovalStates } from '../../organization';
import { loadProposalsList } from '../../actions/proposal';

const title = 'Home';

async function action({ store }) {
  const state = store.getState();

  const user = getSessionUser(state);

  if (user) {
    if (!canAccess(user, title)) {
      return { redirect: '/account' };
    }
    return { redirect: '/feed' };
  }
  const props = {
    state: 'active',
    first: 3,
    approvalState:
      ApprovalStates.CONTENT_APPROVED | ApprovalStates.TOPIC_APPROVED,
  };
  if (!process.env.BROWSER) {
    await store.dispatch(loadProposalsList(props));
  } else {
    store.dispatch(loadProposalsList(props));
  }

  return {
    chunks: ['home'],
    title,
    component: (
      <Layout>
        <Home title={title} />
      </Layout>
    ),
  };
}

export default action;
