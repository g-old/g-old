// @flow
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import WorkTeamForm from '../../components/WorkTeamForm';
import Box from '../../components/Box';
import Heading from '../../components/Heading';

const messages = defineMessages({
  create: {
    id: 'command.createWt',
    description: 'command to create a workteam',
    defaultMessage: 'Create workteam',
  },
});

type Props = { proposalId: ID };

class WorkTeamCreate extends React.Component<Props> {
  render() {
    const { proposalId } = this.props;
    return (
      <Box align column>
        <Heading tag="h2">
          <FormattedMessage {...messages.create} />
        </Heading>
        <WorkTeamForm proposalId={proposalId} />
      </Box>
    );
  }
}

export default WorkTeamCreate;
