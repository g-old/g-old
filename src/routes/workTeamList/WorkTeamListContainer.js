import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { loadWorkTeams } from '../../actions/workTeam';
import {
  getWorkTeams,
  getWorkTeamsIsFetching,
  getWorkTeamsErrorMessage,
} from '../../reducers';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import Headline from '../../components/Headline';
import FetchError from '../../components/FetchError';

import history from '../../history';

/* const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
}); */
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
      <div>
        <Headline>{'Workteams'}</Headline>
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
              <span>
                {u.name} {} {u.surname}
              </span>
            </ListItem>
          ))}
        </List>
      </div>
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
