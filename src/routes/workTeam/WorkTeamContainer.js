import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { loadWorkTeam, joinWorkTeam } from '../../actions/workTeam';
import { createRequest } from '../../actions/request';
import { getWorkTeam, getRequestUpdates } from '../../reducers';
import WorkTeam from '../../components/WorkTeam';

// import FetchError from '../../components/FetchError';

class WorkTeamContainer extends React.Component {
  static propTypes = {
    workTeamData: PropTypes.shape({}),
    requestUpdates: PropTypes.shape({}),
    createRequest: PropTypes.func.isRequired,
    joinWorkTeam: PropTypes.func.isRequired,
  };

  static defaultProps = {
    workTeamData: null,
    requestUpdates: null,
  };
  render() {
    return (
      <WorkTeam
        {...this.props.workTeamData}
        onJoinRequest={this.props.createRequest}
        updates={this.props.requestUpdates || {}}
        onJoin={this.props.joinWorkTeam}
      />
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeamData: getWorkTeam(state, id),
  requestUpdates: getRequestUpdates(state, '0000'),
});

const mapDispatch = {
  loadWorkTeam,
  createRequest,
  joinWorkTeam,
};

export default connect(mapStateToProps, mapDispatch)(WorkTeamContainer);
