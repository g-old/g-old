import React from 'react';
import Layout from '../../components/Layout';
import WorkTeamCreate from './WorkTeamCreate';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'WorkteamManager';

async function action({ store, path }, { id }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  }
  if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    // await store.dispatch(loadWorkTeam({ id }));
  } else {
    // store.dispatch(loadWorkTeam({ id }));
  }
  return {
    chunks: ['workteam'],
    title,
    component: (
      <Layout>
        <WorkTeamCreate proposalId={id} />
      </Layout>
    ),
  };
}
export default action;
