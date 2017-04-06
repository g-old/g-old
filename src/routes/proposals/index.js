import React from 'react';
import Layout from '../../components/Layout';
import { loadProposalsList } from '../../actions/proposal';
import ProposalOverviewContainer from './ProposalsOverviewContainer';

const title = 'Proposals';

export default {
  path: '/proposals/:state',

  async action({ store }, { state }) {
    const user = store.getState().user;
    if (!user.id) {
      return { redirect: '/' };
    }
    // Not sure if this is the right way to hydrate the store
    // Minus: Can't  show loading
    let loadingSuccessful;
    if (!process.env.BROWSER) {
      loadingSuccessful = await store.dispatch(loadProposalsList(state));
    } else {
      store.dispatch(loadProposalsList(state));
      loadingSuccessful = true;
    }
    if (loadingSuccessful) {
      return {
        title,
        component: <Layout><ProposalOverviewContainer state={state} /> </Layout>,
      };
    }
    return {
      title,
      component: <Layout>{'Something BAD happened'} </Layout>,
    };
  },
};
