import React from 'react';
import PropTypes from 'prop-types';
import WorkTeamForm from '../../components/WorkTeamForm';
import Box from '../../components/Box';

class WorkTeamEdit extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };
  render() {
    return (
      <Box align column>
        <h1>Edit workteam</h1>
        <WorkTeamForm id={this.props.id} />
      </Box>
    );
  }
}

export default WorkTeamEdit;
