import React from 'react';
import Layout from '../../components/Layout';
import { loadWorkTeam } from '../../actions/workTeam';
import WorkTeamManagement from './WorkTeamManagement';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'WorkteamManager';

async function action({ store, path }, { id }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadWorkTeam({ id }, true));
  } else {
    store.dispatch(loadWorkTeam({ id }, true));
  }
  return {
    chunks: ['admin'],
    title,
    component: (
      <Layout>
        <WorkTeamManagement id={id} />
      </Layout>
    ),
  };
}
export default action;
