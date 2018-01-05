import React from 'react';
import { connect } from 'react-redux';
import { getWorkTeamStatus } from '../../reducers';

class WorkTeamCreate extends React.Component {
  render() {
    return <h1>{'EDIT'}</h1>;
  }
}

const mapStateToProps = state => ({ status: getWorkTeamStatus(state, '0000') });

export default connect(mapStateToProps)(WorkTeamCreate);
