import React from 'react';
import Layout from '../../components/Layout';
import { loadGroup } from '../../actions/group';
import GroupManagement from './GroupManagement';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'WorkteamManager';

async function action({ store, path }, { id }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: `/workteams/${id}` };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadGroup({ id }, true));
  } else {
    store.dispatch(loadGroup({ id }, true));
  }
  return {
    chunks: ['admin'],
    title,
    component: (
      <Layout>
        <GroupManagement id={id} />
      </Layout>
    ),
  };
}
export default action;
