import React from 'react';
import PropTypes from 'prop-types';
import GroupForm from '../../components/GroupForm';
import Box from '../../components/Box';

class GroupCreate extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };
  render() {
    return (
      <Box align column>
        <h1>{'Edit workteam'}</h1>
        <GroupForm id={this.props.id} />
      </Box>
    );
  }
}

export default GroupCreate;
