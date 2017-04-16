import React from 'react';
import Layout from '../../components/Layout';
import { loadProposal } from '../../actions/proposal';
import ProposalContainer from './ProposalContainer';

const title = 'Proposal';

export default {
  path: '/testproposal/:id',

  async action({ store }, { id }) {
    const data = store.getState();
    const user = data.entities.users[data.user];
    const role = data.entities.roles[user.role] || user.role;
    if (!user.id || role.type === 'viewer') {
      return { redirect: '/' };
    }
    // Not sure if this is the right way to hydrate the store
    // Minus: Can't  show loading
    const loadingSuccessful = await store.dispatch(loadProposal({ id }));
    if (loadingSuccessful) {
      return {
        title,
        component: <Layout><ProposalContainer proposalId={id} /> </Layout>,
      };
    }
    return {
      title,
      component: <Layout>{'Something BAD happened'} </Layout>,
    };
  },
};
