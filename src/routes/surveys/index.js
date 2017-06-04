import React from 'react';
import Layout from '../../components/Layout';
import { loadProposalsList } from '../../actions/proposal';
import SurveyListContainer from './SurveyListContainer';
import { getSessionUser } from '../../reducers';

const title = 'Surveys';

export default {
  path: '/surveys',

  async action({ store }) {
    const user = getSessionUser(store.getState());
    if (!user || user.role.type === 'guest') {
      return { redirect: '/' };
    }
    if (!process.env.BROWSER) {
      await store.dispatch(loadProposalsList('survey'));
    } else {
      store.dispatch(loadProposalsList('survey'));
    }
    return {
      title,
      component: <Layout><SurveyListContainer /> </Layout>,
    };
  },
};
