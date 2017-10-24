import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import { loadUserList } from '../../actions/user';
import AccountListContainer from './AccountListContainer';
import { Groups, canAccess } from '../../organization';

const title = 'AccountList';

async function action({ store, path }) {
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
      loadUserList({ group: Groups.VIEWER | Groups.VOTER, union: true }),
    );
  }

  return {
    title,
    chunks: ['account'],
    component: (
      <Layout>
        <AccountListContainer />
      </Layout>
    ),
  };
}
export default action;
