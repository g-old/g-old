import React from 'react';
import Layout from '../../components/Layout';
import { loadGroups } from '../../actions/group';
import GroupsContainer from './GroupListContainer';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'WorkteamList';

async function action({ store, path }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    // FAKE STATE active, TODO change
    await store.dispatch(loadGroups());
  } else {
    store.dispatch(loadGroups());
  }
  return {
    chunks: ['workteam'],
    title,
    component: (
      <Layout>
        <GroupsContainer />
      </Layout>
    ),
  };
}
export default action;
