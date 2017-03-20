import React from 'react';
import Layout from '../../components/Layout';
import { loadProposalsList } from '../../actions/proposal';
import ProposalOverviewContainer from './ProposalsOverviewContainer';

const title = 'Proposals';

export default {
  path: '/proposals/:state',

  async action({ store }, { state }) {
    if (!store.getState().user) {
      return { redirect: '/' };
    }
    // Not sure if this is the right way to hydrate the store
    // Minus: Can't  show loading
    const loadingSuccessful = await store.dispatch(loadProposalsList(state));
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
