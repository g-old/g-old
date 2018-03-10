import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { loadGroups } from '../../actions/group';
import {
  getGroups,
  getGroupsIsFetching,
  getGroupsErrorMessage,
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
class GroupListContainer extends React.Component {
  static propTypes = {
    loadGroups: PropTypes.func.isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    pending: PropTypes.bool.isRequired,
    error: PropTypes.string,
  };

  static defaultProps = {
    error: null,
  };
  render() {
    const { groups, pending, error } = this.props;
    return (
      <div>
        <Headline>{'Workteams'}</Headline>
        {pending && !groups.length && <p>Loading...</p>}
        {!pending && !groups.length && !error && <p> No data</p>}
        {error && (
          <FetchError
            message={error}
            onRetry={() => this.props.loadGroups()}
          />
        )}
        <List>
          {groups.map(u => (
            <ListItem onClick={() => handleItemClick(u.id)}>
              <span>{u.displayName}</span>
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  groups: getGroups(state),
  pending: getGroupsIsFetching(state),
  error: getGroupsErrorMessage(state),
});

const mapDispatch = {
  loadGroups,
};

export default connect(mapStateToProps, mapDispatch)(GroupListContainer);
