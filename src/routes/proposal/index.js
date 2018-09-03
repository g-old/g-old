import React from 'react';
import Layout from '../../components/Layout';
import { loadProposal } from '../../actions/proposal';
import updateNotificationStatus from '../notificationHelper';

import ProposalContainer from './ProposalContainer';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';
import { createRedirectLink } from '../utils';

const title = 'Proposal';

async function action({ store, path, query }, { id, pollId }) {
  const state = await store.getState();
  const user = getSessionUser(state);
  let proposalId = id;
  if (!user) {
    return { redirect: createRedirectLink(path, query) };
  }
  if (!canAccess(user, title)) {
    return { redirect: '/' };
  }

  if (proposalId === 'xxx') {
    const proposals = state.entities.proposals.byId;
    proposalId = Object.keys(proposals).find(
      pId =>
        proposals[pId].pollOne === pollId || proposals[pId].pollTwo === pollId,
    );

    if (proposalId) {
      return { redirect: `/proposal/${proposalId}/${pollId}` };
    }
    // Proposal not in store -load by pollId;
  }

  if (!process.env.BROWSER) {
    await store.dispatch(loadProposal({ id: proposalId, pollId }));
  } else {
    // in browser

    if (!proposalId) {
      proposalId = await store.dispatch(loadProposal({ pollId }));
      return { redirect: `/proposal/${proposalId}/${pollId}` };
    }
    store.dispatch(loadProposal({ id: proposalId, pollId }));
    updateNotificationStatus(store, query);
  }

  return {
    title,
    chunks: ['proposal'],
    component: (
      <Layout>
        <ProposalContainer
          proposalId={proposalId}
          pollId={pollId}
          user={user}
        />
      </Layout>
    ),
  };
}
export default action;
