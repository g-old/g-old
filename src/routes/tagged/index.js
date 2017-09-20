import React from 'react';
import Layout from '../../components/Layout';
import { loadProposalsList } from '../../actions/proposal';
import TaggedContainer from './TaggedContainer';
import { getSessionUser } from '../../reducers';

const title = 'Tagged';

async function action({ store, path }, { tagId }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (user.role.type === 'guest') {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    // FAKE STATE active, TODO change
    await store.dispatch(loadProposalsList({ state: 'active', tagId }));
  } else {
    store.dispatch(loadProposalsList({ state: 'active', tagId }));
  }
  return {
    chunks: ['proposals'],
    title,
    component: (
      <Layout>
        <TaggedContainer tagId={tagId} />
      </Layout>
    ),
  };
}
export default action;
