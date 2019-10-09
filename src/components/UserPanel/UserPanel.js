import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, defineMessages } from 'react-intl';
import { createMessage, updateMessage } from '../../actions/message';
import { updateUser, loadUserList, findUser } from '../../actions/user';
import AccountDetails from '../AccountDetails';

import SearchField from '../SearchField';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
import Layer from '../Layer';
import { Groups } from '../../organization';
import {
  getVisibleUsers,
  getUsersStatus,
  getSessionUser,
  getMessageUpdates,
  getResourcePageInfo,
} from '../../reducers';
import UserFilter from './UserFilter';
import AssetsTable from '../AssetsTable';
import UserRow from './UserRow';
import { genUsersPageKey } from '../../reducers/pageInfo';

const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
  messages: {
    id: 'label.messages',
    defaultMessage: 'Messages',
    description: 'Messages label',
  },
});

// eslint-disable-next-line no-bitwise
const VIEWERS = Groups.VIEWER | Groups.GUEST;

class UserPanel extends React.Component {
  static propTypes = {
    loadUserList: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    fetchUsers: PropTypes.func.isRequired,
    findUser: PropTypes.func.isRequired,
    userArray: PropTypes.arrayOf(PropTypes.object).isRequired,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      permissions: PropTypes.number,
    }).isRequired,
    createMessage: PropTypes.func.isRequired,
    updateMessage: PropTypes.func.isRequired,
    messageUpdates: PropTypes.shape({}).isRequired,
    pageInfo: PropTypes.shape({
      pagination: PropTypes.shape({ hasNextPage: PropTypes.bool }),
      pending: PropTypes.bool,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      showAccount: false,
      filter: {
        verificationStatus: null,
        group: null,
        union: false,
      },
    };
    this.handleProfileClick = this.handleProfileClick.bind(this);
    this.handleLayerClosing = this.handleLayerClosing.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.onMenuClick = this.onMenuClick.bind(this);
    this.toggleLayer = this.toggleLayer.bind(this);
  }

  componentDidMount() {
    // this.props.loadUserList('viewer');
  }

  handleProfileClick({ id }) {
    this.setState({ showAccount: true, accountId: id });
    // history.push(`/admin/accounts/${id}`);
  }

  handleLayerClosing() {
    this.setState({ showAccount: false });
  }

  onMenuClick(action, data) {
    this.setState({ currentUser: data, showLayer: true });
  }

  toggleLayer() {
    this.setState(prevState => ({ showLayer: !prevState.showLayer }));
  }

  fetchUsers(after) {
    const { fetchUsers } = this.props;
    const { filter } = this.state;
    fetchUsers({
      after,
      union: filter.union,
      group: filter.group && filter.group.value,
      verificationStatus:
        filter.verificationStatus && filter.verificationStatus.value,
    });
  }

  handleFilterChange(data) {
    this.setState(prevState => {
      if (prevState.filter[data.type]) {
        let toDelete;
        if (prevState.filter.objectId && data.type === 'type') {
          toDelete = true;
        }

        const { [data.type]: omit, ...filter } = prevState.filter;
        return {
          filter: {
            ...filter,
            ...(omit === data.value ? [] : { [data.type]: data.value }),
            ...(toDelete ? { objectId: undefined } : []),
          },
        };
      }
      return { filter: { ...prevState.filter, [data.type]: data.value } };
    }, this.fetchUsers);
  }

  render() {
    const {
      userArray,
      user,
      findUser: fetchUser,
      updateUser: mutateUser,
      pageInfo,
    } = this.props;
    const {
      showAccount,
      accountId,
      filter,
      showLayer,
      currentUser,
    } = this.state;
    if (!user) return null;
    return (
      <Box padding="medium" column>
        <FormField overflow label="Username">
          <SearchField
            data={userArray}
            fetch={fetchUser}
            displaySelected={data => {
              this.setState({ accountId: data.id, showAccount: true });
            }}
          />
        </FormField>
        {showAccount && (
          <Layer onClose={this.handleLayerClosing}>
            <AccountDetails
              user={user}
              accountId={accountId}
              update={mutateUser}
              onClose={this.handleLayerClosing}
            />
          </Layer>
        )}
        <UserFilter values={filter} onSelect={this.handleFilterChange} />
        <AssetsTable
          onClickMenu={this.onMenuClick}
          allowMultiSelect
          searchTerm=""
          noRequestsFound="No requests found"
          checkedIndices={[]}
          assets={userArray || []}
          row={UserRow}
          tableHeaders={[
            'Avatar',
            'Name',
            'VerificationStatus',
            'Last login',
            'Created at',
          ]}
        />
        {pageInfo.pagination.hasNextPage && (
          <Button
            primary
            disabled={pageInfo.pending}
            onClick={this.handleLoadMore}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
        {showLayer && (
          <Layer onClose={this.toggleLayer}>
            <AccountDetails
              user={user}
              accountId={currentUser.id}
              update={mutateUser}
              onClose={this.toggleLayer}
            />
          </Layer>
        )}
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  guestArray: getVisibleUsers(state, Groups.GUEST),
  viewerArray: getVisibleUsers(state, VIEWERS),
  guestArrayStatus: getUsersStatus(state, Groups.GUEST),
  viewerArrayStatus: getUsersStatus(state, VIEWERS),
  userArray: getVisibleUsers(state, 'all'),
  user: getSessionUser(state),
  messageUpdates: getMessageUpdates(state),
  pageInfo: getResourcePageInfo(
    state,
    'users',
    genUsersPageKey({ group: state.groups, union: state.asUnion }),
  ),
});

const mapDispatch = {
  updateUser,
  fetchUsers: loadUserList,

  findUser,
  createMessage,
  updateMessage,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(UserPanel);
