import React from 'react';
import Layout from '../../components/Layout';
import { loadProposalsList } from '../../actions/proposal';
import SurveysOverviewContainer from './SurveysOverviewContainer';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'Surveys';

async function action({ store, path }, { filter }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  const closed = filter === 'closed';
  if (!process.env.BROWSER) {
    await store.dispatch(loadProposalsList({ state: 'survey', closed }));
  } else {
    store.dispatch(loadProposalsList({ state: 'survey', closed }));
  }
  return {
    chunks: ['surveys'],
    title,
    component: (
      <Layout>
        <SurveysOverviewContainer filter={filter} />
      </Layout>
    ),
  };
}
export default action;
