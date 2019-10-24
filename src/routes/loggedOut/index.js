import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import Layout from '../../components/Layout';
import Login from '../../components/Login';
import Heading from '../../components/Heading';
import Box from '../../components/Box';
import Label from '../../components/Label/Label';
import Button from '../../components/Button/Button';
import history from '../../history';

const messages = defineMessages({
  out: {
    id: 'notice.loggedOut',
    defaultMessage: 'You are logged out.',
    description: 'notice when user is logged out',
  },
  thanks: {
    id: 'labels.thankyou',
    defaultMessage: 'Thank you for the visit!',
    description: 'notice when sees logged out page',
  },
  start: {
    id: 'labels.startpage',
    defaultMessage: 'Start Page',
    description: 'label of start page',
  },
});
async function action() {
  return {
    chunks: ['loggedOut'],
    title: 'Logged out',
    component: (
      <Layout>
        <Box fill justify>
          <Box column>
            <Box column align>
              <Heading tag="h2">
                <FormattedMessage {...messages.out} />
              </Heading>
              <br />
              <Label>
                <FormattedMessage {...messages.thanks} />
              </Label>
              <Button accent onClick={() => history.push('/')}>
                <FormattedMessage {...messages.start} />
              </Button>
            </Box>
            <Login />
          </Box>
        </Box>
      </Layout>
    ),
  };
}

export default action;
