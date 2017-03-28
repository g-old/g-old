import React from 'react';
import Layout from '../../components/Layout';
import CreateProposal from '../../components/CreateProposal';

const title = 'Create a proposal';

export default {
  path: '/proposalinput',

  async action({ store }) {
    if (!store.getState().user) {
      return { redirect: '/' };
    }
    // Not sure if this is the right way to hydrate the store
    // Minus: Can't  show loading
    const loadingSuccessful = true;

    if (loadingSuccessful) {
      return {
        title,
        component: <Layout><CreateProposal /> </Layout>,
      };
    }
    return {
      title,
      component: <Layout>{'Something BAD happened'} </Layout>,
    };
  },
};
