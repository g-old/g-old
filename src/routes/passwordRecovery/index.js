import React from 'react';
import Layout from '../../components/Layout';
import PasswordRecovery from './PasswordRecovery';

const title = 'Recover your Password';

async function action() {
  return {
    chunks: ['passwordRecovery'],
    title,
    component: (
      <Layout>
        <PasswordRecovery />{' '}
      </Layout>
    ),
  };
}

export default action;
