import React from 'react';
import Layout from '../../components/Layout';
import SignUp from '../../components/SignUp';

const title = 'SignUp';

export default {
  path: '/signup',

  async action() {
    return {
      title,
      component: <Layout><SignUp /> </Layout>,
    };
  },
};
