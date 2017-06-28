import React from 'react';
import Layout from '../../components/Layout';
import { loadProposal } from '../../actions/proposal';
import ProposalContainer from './ProposalContainer';
import { getSessionUser } from '../../reducers';

const title = 'Proposal';

export default {
  path: '/proposal/:id/:pollId',

  async action({ store, path }, { id, pollId }) {
    const state = await store.getState();
    const user = getSessionUser(state);

    if (!user) {
      return { redirect: `/?redirect=${path}` };
    } else if (user.role.type === 'guest') {
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
          <ProposalContainer proposalId={id} pollId={pollId} user={user} />
        </Layout>
      ),
    };
  },
};
