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

const title =
  'Volksinitiative - Initiativa popolare | Volksgesetzgebung online für Südtirol';

const description =
  'Stimme ab über Vorschläge zu Volksinitiativen und Volksbegehren für Südtirol! Arbeite mit an einem Poliktikwechsel für mehr Direkte Demokratie im Land.';
async function action({ store, locale }) {
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
    first: 5,
    approvalState:
      ApprovalStates.CONTENT_APPROVED | ApprovalStates.TOPIC_APPROVED,
  };
  let data;

  const fetchTextContent = () =>
    new Promise(resolve => {
      require.ensure(
        [],
        require => {
          try {
            resolve(require(`./content/data.${locale}.json`)); // eslint-disable-line import/no-dynamic-require
          } catch (e) {
            resolve(require('./content/data.json'));
          }
        },
        'home',
      );
    });
  if (!process.env.BROWSER) {
    await store.dispatch(loadProposalsList(props));
    data = await fetchTextContent();
  } else {
    store.dispatch(loadProposalsList(props));
    data = await fetchTextContent();
  }

  return {
    chunks: ['home'],
    title,
    description,
    component: (
      <Layout>
        <Home title={title} data={data} />
      </Layout>
    ),
  };
}

export default action;
