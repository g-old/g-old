import React from 'react';
import Layout from '../../components/Layout';
import PasswordRecovery from './PasswordRecovery';

const title = 'Recover your Password';

export default {
  path: '/account/password/reset',

  async action() {
    return {
      title,
      component: <Layout><PasswordRecovery /> </Layout>,
    };
  },
};
