import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getWorkTeamStatus } from '../../reducers';
import WorkTeamForm from '../workTeamEdit/WorkTeamEdit';
import Box from '../../components/Box';

class WorkTeamCreate extends React.Component {
  static propTypes = {
    status: PropTypes.shape({ success: PropTypes.bool }).isRequired,
  };
  render() {
    return (
      <Box align column>
        {this.props.status.success && 'SUCCESS'}
        <h1>{'Create workteam'}</h1>
        {JSON.stringify(this.props.status)}
        <WorkTeamForm id="create" workTeam={{}} />
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  status: getWorkTeamStatus(state, 'create'),
});

export default connect(mapStateToProps)(WorkTeamCreate);
