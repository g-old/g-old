import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { loadUserList } from '../../actions/user';
import { Groups } from '../../organization';
import { getVisibleUsers, getResourcePageInfo } from '../../reducers';

import Box from '../../components/Box';
import Heading from '../../components/Heading';
import ListView from '../../components/ListView';
import { genUsersPageKey } from '../../reducers/pageInfo';
import UserListItem from './UserListItem';
import history from '../../history';

// eslint-disable-next-line no-bitwise
const ACTIVE_USER = Groups.VIEWER | Groups.VOTER;
const messages = defineMessages({
  users: {
    id: 'users',
    defaultMessage: 'Users',
    description: 'Users label',
  },
});
const onUserClick = id => {
  history.push(`/accounts/${id}`);
};
// TODO don't user List component - onClick is not cheap
class AccountList extends React.Component {
  static propTypes = {
    loadUserList: PropTypes.func.isRequired,
    userList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    userListStatus: PropTypes.shape({}).isRequired,
    pageInfo: PropTypes.shape({}).isRequired,
  };

  constructor(props) {
    super(props);
    this.handleLoadMore = this.handleLoadMore.bind(this);
    this.handleOnRetry = this.handleOnRetry.bind(this);
  }

  handleLoadMore({ after }) {
    const { loadUserList: loadUsers } = this.props;
    loadUsers({
      group: ACTIVE_USER,
      union: true,
      after,
    });
  }

  handleOnRetry() {
    const { loadUserList: loadUsers } = this.props;

    loadUsers({ group: ACTIVE_USER, union: true });
  }

  render() {
    const { userList, pageInfo } = this.props;
    return (
      <Box pad column>
        <Heading tag="h3">
          <div style={{ paddingLeft: '0.5em' }}>
            <FormattedMessage {...messages.users} /> ({pageInfo.totalCount})
          </div>
        </Heading>
        <ListView
          onRetry={this.handleOnRetry}
          onLoadMore={this.handleLoadMore}
          pageInfo={pageInfo}
        >
          {userList.map(
            u => u && <UserListItem user={u} onClick={onUserClick} />,
          )}
        </ListView>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  userList: getVisibleUsers(state, 'all'),
  pageInfo: getResourcePageInfo(
    state,
    'users',
    genUsersPageKey({ union: true, group: ACTIVE_USER }),
  ),
});

const mapDispatch = {
  loadUserList,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(AccountList);
