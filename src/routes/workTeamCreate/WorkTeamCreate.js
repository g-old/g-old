// @flow
import React from 'react';
import WorkTeamForm from '../../components/WorkTeamForm';
import Box from '../../components/Box';

type Props = { proposalId: ID };

class WorkTeamCreate extends React.Component<Props> {
  render() {
    const { proposalId } = this.props;
    return (
      <Box align column>
        <h1>Create workteam</h1>
        <WorkTeamForm proposalId={proposalId} />
      </Box>
    );
  }
}

export default WorkTeamCreate;
