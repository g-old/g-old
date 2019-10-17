import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { loadWorkTeams } from '../../actions/workTeam';
import {
  getWorkTeams,
  getWorkTeamsIsFetching,
  getWorkTeamsErrorMessage,
} from '../../reducers';
import Heading from '../../components/Heading';
import Box from '../../components/Box';
import ListView from '../../components/ListView';
import WorkteamItem from './WorkteamItem';

import history from '../../history';

const messages = defineMessages({
  workTeams: {
    id: 'workTeams',
    defaultMessage: 'Workteams',
    description: 'Workteam label',
  },
});
const handleItemClick = id => {
  history.push(`/workteams/${id}`);
};
// TODO don't user List component - onClick is not cheap
class WorkTeamListContainer extends React.Component {
  static propTypes = {
    loadWorkTeams: PropTypes.func.isRequired,
    workTeams: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    pending: PropTypes.bool.isRequired,
    error: PropTypes.string,
  };

  static defaultProps = {
    error: null,
  };

  constructor(props) {
    super(props);
    this.handleOnRetry = this.handleOnRetry.bind(this);
  }

  handleOnRetry() {
    const { loadWorkTeams: fetchTeams } = this.props;
    fetchTeams();
  }

  render() {
    const { workTeams, pending, error } = this.props;
    return (
      <Box pad column>
        <Heading tag="h3">
          <div style={{ paddingLeft: '0.5em' }}>
            <FormattedMessage {...messages.workTeams} />
          </div>
        </Heading>
        <ListView
          boxed
          onRetry={this.handleOnRetry}
          pageInfo={{ pending, errorMessage: error }}
        >
          {workTeams.map(
            w => w && <WorkteamItem workteam={w} onClick={handleItemClick} />,
          )}
        </ListView>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  workTeams: getWorkTeams(state),
  pending: getWorkTeamsIsFetching(state),
  error: getWorkTeamsErrorMessage(state),
});

const mapDispatch = {
  loadWorkTeams,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(WorkTeamListContainer);
