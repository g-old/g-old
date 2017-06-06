import React from 'react';
import Layout from '../../components/Layout';
import Login from '../../components/Login';

export default {
  path: '/logged-out',

  async action() {
    return {
      title: 'Logged out',
      component: (
        <Layout>
          <div
            style={{
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '20px',
            }}
          >
            <div
              style={{
                padding: '0 0 40px',
                maxWidth: '380px',
              }}
            >
              <div style={{ marginBottom: '3em' }}>
                <span style={{ fontSize: '1.5em' }}>LOGGED OUT </span>
                <br />
                <span style={{ fontSize: '1em' }}>Thank you for the visit </span>

                <br />
                <span style={{ fontSize: '1em' }}>Come back? </span>
              </div>
              <Login />
            </div>
          </div>
        </Layout>
      ),
    };
  },
};
