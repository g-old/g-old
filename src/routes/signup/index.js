import React from 'react';
import Layout from '../../components/Layout';
import SignupContainer from './SignupContainer';

const title = 'SignUp';

export default {
  path: '/signup',

  async action() {
    return {
      title,
      component: <Layout><SignupContainer /> </Layout>,
    };
  },
};
