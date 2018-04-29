import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { loadGroupMembers } from '../../actions/group';
import { getGroup, getGroupStatus } from '../../reducers';
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
    loadGroupMembers: PropTypes.func.isRequired,
    group: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    status: PropTypes.shape({}).isRequired,
  };
  render() {
    const { status, group } = this.props;
    const memberList = group.members || [];
    return (
      <Box pad column>
        <Heading tag="h2">
          <FormattedMessage {...messages.members} /> {group.displayName}
        </Heading>
        {status.pending && !memberList.length && <p>Loading...</p>}
        {!status.pending &&
          !memberList.length &&
          !status.error && <p> No data</p>}
        {status.error && (
          <FetchError
            message={status.error}
            onRetry={() =>
              this.props.loadGroupMembers({
                id: this.props.group.id,
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
  group: getGroup(state, id),
  status: getGroupStatus(state),
});

const mapDispatch = {
  loadGroupMembers,
};

export default connect(mapStateToProps, mapDispatch)(AccountList);
