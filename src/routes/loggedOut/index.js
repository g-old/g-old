import React from 'react';
import Layout from '../../components/Layout';

export default {
  path: '/logged-out',

  async action() {
    return {
      title: 'Logged out',
      component: <Layout>LOGGED OUT</Layout>,
    };
  },
};
