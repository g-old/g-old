import React from 'react';
import Layout from '../../components/Layout';
import { loadProposalsList } from '../../actions/proposal';
import ProposalOverviewContainer from './ProposalsOverviewContainer';
import { getSessionUser } from '../../reducers';
import { RESET_ACTIVITY_COUNTER } from '../../constants';

const title = 'Proposals';

async function action({ store, path }, { state }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (user.role.type === 'guest') {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadProposalsList({ state }));
  } else {
    store.dispatch(loadProposalsList({ state }));
  }
  store.dispatch({ type: RESET_ACTIVITY_COUNTER, payload: { proposals: true } });

  return {
    chunks: ['proposals'],
    title,
    component: (
      <Layout>
        <ProposalOverviewContainer state={state} />{' '}
      </Layout>
    ),
  };
}

export default action;
