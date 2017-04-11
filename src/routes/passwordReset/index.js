import React from 'react';
import Layout from '../../components/Layout';
import PasswordReset from './PasswordReset';

const title = 'Reset your Password';

export default {
  path: '/reset/:token',

  async action(store, { token }) {
    // TODO check if token is valid and not expirated
    return {
      title,
      component: <Layout><PasswordReset token={token} /> </Layout>,
    };
  },
};
