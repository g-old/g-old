import React from 'react';
import Layout from '../../components/Layout';
import { loadProposal } from '../../actions/proposal';
import ProposalContainer from './ProposalContainer';
import { getSessionUser } from '../../reducers';

const title = 'Proposal';

export default {
  path: '/testproposal/:id/:filter',

  async action({ store }, { id }) {
    const user = getSessionUser(store.getState());
    if (!user || user.role.type === 'viewer') {
      return { redirect: '/' };
    }
    if (!process.env.BROWSER) {
      await store.dispatch(loadProposal({ id }));
    } else {
      store.dispatch(loadProposal({ id }));
    }

    return {
      title,
      component: (
        <Layout>
          <ProposalContainer
            proposalId={id}
            user={user}
            fetchData={() => {
              store.dispatch(loadProposal({ id }));
            }}
          />{' '}
        </Layout>
      ),
    };
  },
};
