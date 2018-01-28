import React from 'react';
import Layout from '../../components/Layout';
import { loadWorkTeam } from '../../actions/workTeam';
import WorkTeamContainer from './WorkTeamContainer';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'Workteam';

async function action({ store, path }, { id }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  const state = 'active';
  if (!process.env.BROWSER) {
    await store.dispatch(loadWorkTeam({ id, state }));
  } else {
    store.dispatch(loadWorkTeam({ id, state }));
  }
  return {
    chunks: ['workteam'],
    title,
    component: (
      <Layout>
        <WorkTeamContainer id={id} />
      </Layout>
    ),
  };
}
export default action;
