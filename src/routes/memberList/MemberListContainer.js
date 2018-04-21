import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { loadWorkTeamMembers } from '../../actions/workTeam';
import { getWorkTeam, getWorkTeamStatus } from '../../reducers';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import Avatar from '../../components/Avatar';
import FetchError from '../../components/FetchError';
import Box from '../../components/Box';
import Heading from '../../components/Heading';

import history from '../../history';

// eslint-disable-next-line no-bitwise
const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
  members: {
    id: 'members',
    defaultMessage: 'Members',
    description: 'Members label',
  },
});
const handleItemClick = id => {
  history.push(`/accounts/${id}`);
};
// TODO don't user List component - onClick is not cheap
class AccountList extends React.Component {
  static propTypes = {
    loadWorkTeamMembers: PropTypes.func.isRequired,
    workTeam: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    status: PropTypes.shape({}).isRequired,
  };
  render() {
    const { status, workTeam } = this.props;
    const memberList = workTeam.members || [];
    return (
      <Box pad column>
        <Heading tag="h2">
          <FormattedMessage {...messages.members} /> {workTeam.displayName}
        </Heading>
        {status.pending && !memberList.length && <p>Loading...</p>}
        {!status.pending &&
          !memberList.length &&
          !status.error && <p> No data</p>}
        {status.error && (
          <FetchError
            message={status.error}
            onRetry={() =>
              this.props.loadWorkTeamMembers({
                id: this.props.workTeam.id,
              })
            }
          />
        )}
        <List>
          {memberList.map(u => (
            <ListItem onClick={() => handleItemClick(u.id)}>
              <Box pad>
                <Avatar user={u} />
                <span>
                  {u.name} {} {u.surname}
                </span>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeam: getWorkTeam(state, id),
  status: getWorkTeamStatus(state),
});

const mapDispatch = {
  loadWorkTeamMembers,
};

export default connect(mapStateToProps, mapDispatch)(AccountList);
