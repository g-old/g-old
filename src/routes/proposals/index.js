import React from 'react';
import Layout from '../../components/Layout';
import { loadProposalsList } from '../../actions/proposal';
import ProposalOverviewContainer from './ProposalsOverviewContainer';
import { getSessionUser } from '../../reducers';

const title = 'Proposals';

export default {
  path: '/proposals/:state',

  async action({ store }, { state }) {
    const user = getSessionUser(store.getState());
    if (!user || user.role.type === 'guest') {
      return { redirect: '/' };
    }
    if (!process.env.BROWSER) {
      await store.dispatch(loadProposalsList({ state }));
    } else {
      store.dispatch(loadProposalsList({ state }));
    }
    return {
      title,
      component: (
        <Layout>
          <ProposalOverviewContainer state={state} />
          {' '}
        </Layout>
      ),
    };
  },
};
