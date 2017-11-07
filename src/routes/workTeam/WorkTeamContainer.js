import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { loadWorkTeam } from '../../actions/workTeam';
import { getWorkTeam } from '../../reducers';
import WorkTeam from '../../components/WorkTeam';

// import FetchError from '../../components/FetchError';

class WorkTeamContainer extends React.Component {
  static propTypes = {
    workTeamData: PropTypes.shape({}),
  };

  static defaultProps = {
    workTeamData: null,
  };
  render() {
    return <WorkTeam {...this.props.workTeamData} />;
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeamData: getWorkTeam(state, id),
});

const mapDispatch = {
  loadWorkTeam,
};

export default connect(mapStateToProps, mapDispatch)(WorkTeamContainer);
