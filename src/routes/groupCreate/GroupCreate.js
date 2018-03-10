import React from 'react';
import GroupForm from '../../components/GroupForm';
import Box from '../../components/Box';

class GroupCreate extends React.Component {
  render() {
    return (
      <Box align column>
        <h1>{'Create workteam'}</h1>
        <GroupForm />
      </Box>
    );
  }
}

export default GroupCreate;
