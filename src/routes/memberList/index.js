import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import { loadWorkTeamMembers } from '../../actions/workTeam';
import MemberListContainer from './MemberListContainer';
import { canAccess } from '../../organization';

const title = 'AccountList';

async function action({ store, path }, { id }) {
  const state = await store.getState();
  const user = getSessionUser(state);
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }

  // Dont load in SSR
  if (process.env.BROWSER) {
    store.dispatch(
      // eslint-disable-next-line no-bitwise
      loadWorkTeamMembers({ id }),
    );
  }

  return {
    title,
    chunks: ['workteam'],
    component: (
      <Layout>
        <MemberListContainer id={id} />
      </Layout>
    ),
  };
}
export default action;
