import React from 'react';
import Layout from '../../components/Layout';
import { loadWorkTeams } from '../../actions/workTeam';
import WorkTeamsContainer from './WorkTeamListContainer';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'WorkteamList';

async function action({ store, path }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  }
  if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    // FAKE STATE active, TODO change
    await store.dispatch(loadWorkTeams(false, true));
  } else {
    store.dispatch(loadWorkTeams(false, true));
  }
  return {
    chunks: ['workteam'],
    title,
    component: (
      <Layout>
        <WorkTeamsContainer />
      </Layout>
    ),
  };
}
export default action;
