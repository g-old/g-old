import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser, getUser } from '../../reducers';
import { fetchProfileData } from '../../actions/user';
import AccountContainer from '../account/AccountContainer';

const title = 'User account';

async function action({ store, path }, { id }) {
  const state = await store.getState();
  const sessionUser = getSessionUser(state);
  // const sessionUser = getSessionUser(state);
  const ownAccount = false;
  let alreadyFetched = false;
  if (!sessionUser) {
    return { redirect: `/?redirect=${path}` };
  }
  // eslint-disable-next-line eqeqeq

  let user = getUser(state, id);
  if (!user) {
    if (!process.env.BROWSER) {
      await store.dispatch(fetchProfileData({ id }));
      alreadyFetched = true;
    }
    // user = await store.dispatch(fetchProfileData({ id }));
    user = { id };
  }

  return {
    title,
    chunks: ['account'],
    component: (
      <Layout>
        <AccountContainer
          user={user}
          ownAccount={ownAccount}
          fetched={alreadyFetched}
        />
      </Layout>
    ),
  };
}
export default action;
