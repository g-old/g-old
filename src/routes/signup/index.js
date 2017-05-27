import React from 'react';
import Layout from '../../components/Layout';
import SignupContainer from './SignupContainer';
import { getSessionUser } from '../../reducers';

const title = 'SignUp';

export default {
  path: '/signup',

  async action({ store }) {
    const user = getSessionUser(store.getState());
    if (user) {
      return { redirect: '/' };
    }
    return {
      title,
      component: <Layout><SignupContainer /> </Layout>,
    };
  },
};
