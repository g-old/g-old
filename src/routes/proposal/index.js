import React from 'react';
import Layout from '../../components/Layout';
import { loadProposal } from '../../actions/proposal';
import { updateNotification } from '../../actions/notification';

import ProposalContainer from './ProposalContainer';
import { getSessionUser, getNotification } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'Proposal';

async function action({ store, path, query }, { id, pollId }) {
  const state = await store.getState();
  const user = getSessionUser(state);
  let proposalId = id;
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
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
    if (!proposalId) {
      proposalId = await store.dispatch(loadProposal({ pollId }));
      return { redirect: `/proposal/${proposalId}/${pollId}` };
    }
    store.dispatch(loadProposal({ id: proposalId, pollId }));
  }

  if (query && query.ref === 'notification') {
    // check if notification in store
    const notification = getNotification(state, query.id);
    if (notification && !notification.read) {
      await store.dispatch(updateNotification({ id: query.id, read: true }));
    }
    // ignore if not
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
