import React from 'react';
import Layout from '../../components/Layout';
import { loadProposalsList } from '../../actions/proposal';
import SurveyListContainer from './SurveyListContainer';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'Surveys';

async function action({ store, path }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadProposalsList({ state: 'survey' }));
  } else {
    store.dispatch(loadProposalsList({ state: 'survey' }));
  }
  return {
    chunks: ['surveys'],
    title,
    component: (
      <Layout>
        <SurveyListContainer />
      </Layout>
    ),
  };
}
export default action;
