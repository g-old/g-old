import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import AccountContainer from './AccountContainer';

const title = 'User account';

async function action({ store, path }) {
  const state = await store.getState();
  const user = getSessionUser(state);
  // const sessionUser = getSessionUser(state);
  const alreadyFetched = false;
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  }
  const ownAccount = true;
  // eslint-disable-next-line eqeqeq
  /*  if (user.id != id) {
    ownAccount = false;
    user = getUser(state, id);
    if (!user) {
      if (!process.env.BROWSER) {
        await store.dispatch(fetchProfileData({ id }));
        alreadyFetched = true;
      }
      // user = await store.dispatch(fetchProfileData({ id }));
      user = { id };
    }
  } */

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
