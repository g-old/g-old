import React from 'react';
import { connect } from 'react-redux';
import { getWorkTeamStatus } from '../../reducers';
import WorkTeamForm from '../workTeamEdit/WorkTeamEdit';
import Box from '../../components/Box';

class WorkTeamCreate extends React.Component {
  render() {
    return (
      <Box>
        <h1>{'CREATE'}</h1> <WorkTeamForm id="create" workTeam={{}} />
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  status: getWorkTeamStatus(state, 'create'),
});

export default connect(mapStateToProps)(WorkTeamCreate);
