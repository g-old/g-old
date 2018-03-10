import React from 'react';
import Layout from '../../components/Layout';
import { loadGroup } from '../../actions/group';
import GroupContainer from './GroupContainer';
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
    await store.dispatch(loadGroup({ id, state }));
  } else {
    store.dispatch(loadGroup({ id, state }));
  }
  return {
    chunks: ['workteam'],
    title,
    component: (
      <Layout>
        <GroupContainer id={id} />
      </Layout>
    ),
  };
}
export default action;
