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
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import Heading from '../../components/Heading';
import FetchError from '../../components/FetchError';
import Box from '../../components/Box';
import { ICONS } from '../../constants';

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
  render() {
    const { workTeams, pending, error } = this.props;
    return (
      <Box pad column>
        <Heading tag="h2">
          <FormattedMessage {...messages.workTeams} />{' '}
        </Heading>
        {pending && !workTeams.length && <p>Loading...</p>}
        {!pending && !workTeams.length && !error && <p> No data</p>}
        {error && (
          <FetchError
            message={error}
            onRetry={() => this.props.loadWorkTeams()}
          />
        )}
        <List>
          {workTeams.map(u => (
            <ListItem onClick={() => handleItemClick(u.id)}>
              <Box pad>
                <svg
                  version="1.1"
                  viewBox="0 0 24 24"
                  width="24px"
                  height="24px"
                  role="img"
                  aria-label="organization"
                >
                  <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    d={ICONS.workteam}
                  />
                </svg>
                <span>{u.displayName}</span>
              </Box>
            </ListItem>
          ))}
        </List>
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

export default connect(mapStateToProps, mapDispatch)(WorkTeamListContainer);
