import React from 'react';
import Layout from '../../components/Layout';
import { loadGroup } from '../../actions/group';
import GroupCreate from './GroupCreate';
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
    // await store.dispatch(loadGroup({ id }));
  } else {
    store.dispatch(loadGroup({ id }));
  }
  return {
    chunks: ['admin'],
    title,
    component: (
      <Layout>
        <GroupCreate />
      </Layout>
    ),
  };
}
export default action;
