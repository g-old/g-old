import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadUserList } from '../../actions/user';
import { Groups } from '../../organization';
import { getVisibleUsers, getResourcePageInfo } from '../../reducers';
import { genUsersPageKey } from '../../reducers/pageInfo';
import history from '../../history';
import AccountsView from '../../components/AccountsView';

// eslint-disable-next-line no-bitwise
const ACTIVE_USER = Groups.VIEWER | Groups.VOTER;

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
      <AccountsView
        userCount={pageInfo.totalCount}
        onRetry={this.handleOnRetry}
        onLoadMore={this.handleLoadMore}
        pageInfo={pageInfo}
        onUserClick={onUserClick}
        users={userList}
      />
    );
  }
}

const mapStateToProps = state => ({
  userList: getVisibleUsers(state, ACTIVE_USER),
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
