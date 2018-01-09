import React from 'react';
import WorkTeamForm from '../../components/WorkTeamForm';
import Box from '../../components/Box';

class WorkTeamCreate extends React.Component {
  render() {
    return (
      <Box align column>
        <h1>{'Create workteam'}</h1>
        <WorkTeamForm />
      </Box>
    );
  }
}

export default WorkTeamCreate;
